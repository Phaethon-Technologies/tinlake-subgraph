import { log, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import {
  RewardDailyInvestorTokenBalance,
  Pool,
  PoolAddresses,
  RewardBalance,
  RewardDayTotal,
  RewardByToken,
  RewardClaim,
} from '../../generated/schema'
import { loadOrCreatePoolInvestors } from './TokenBalance'
import { rewardsAreEligible } from './Day'
import { initialRewardRate, secondsInDay, tierOneRewards, zeroAddress } from '../config'
import { loadOrCreateRewardClaim } from './Claim'

// add current pool's value to today's system value
export function updateRewardDayTotal(date: BigInt, pool: Pool): RewardDayTotal {
  let rdt = loadOrCreateRewardDayTotal(date)
  rdt.todayValue = rdt.todayValue.plus(pool.assetValue)
  let prevDayId = date.minus(BigInt.fromI32(secondsInDay))
  let prevDayRewardTotal = loadOrCreateRewardDayTotal(prevDayId)
  rdt.toDateAggregateValue = rdt.todayValue.plus(prevDayRewardTotal.toDateAggregateValue)
  rdt.save()
  return rdt
}

export function loadOrCreateRewardDayTotal(date: BigInt): RewardDayTotal {
  let rewardDayTotal = RewardDayTotal.load(date.toString())
  if (rewardDayTotal == null) {
    rewardDayTotal = new RewardDayTotal(date.toString())
    rewardDayTotal.todayValue = BigInt.fromI32(0)
    rewardDayTotal.toDateAggregateValue = BigInt.fromI32(0)
    // 0.0042 RAD/DAI up to 1M RAD
    rewardDayTotal.rewardRate = BigDecimal.fromString(initialRewardRate)
    rewardDayTotal.todayReward = BigDecimal.fromString('0')
    rewardDayTotal.toDateRewardAggregateValue = BigDecimal.fromString('0')
  }
  rewardDayTotal.save()
  return <RewardDayTotal>rewardDayTotal
}

export function loadOrCreateRewardBalance(address: string): RewardBalance {
  let rb = RewardBalance.load(address)
  if (rb == null) {
    rb = new RewardBalance(address)
    let rc = loadOrCreateRewardClaim(address, zeroAddress)
    rb.claims = [rc.id]
    rb.pendingRewards = BigDecimal.fromString('0')
    rb.claimableRewards = BigDecimal.fromString('0')
    rb.totalRewards = BigDecimal.fromString('0')
    rb.nonZeroBalanceSince = BigInt.fromI32(0)
    rb.save()
  }
  return <RewardBalance>rb
}

export function loadOrCreateRewardByToken(account: string, token: string): RewardByToken {
  let id = account.concat(token)
  let rbt = RewardByToken.load(id)
  if (rbt == null) {
    rbt = new RewardByToken(id)
    rbt.account = account
    rbt.token = token
    rbt.rewards = BigDecimal.fromString('0')
    rbt.save()
  }
  return <RewardByToken>rbt
}

function updateInvestorRewardsByToken(
  addresses: PoolAddresses,
  ditb: RewardDailyInvestorTokenBalance,
  rate: BigDecimal
): void {
  // add an entity per token that they have invested in
  if (ditb.seniorTokenValue.gt(BigInt.fromI32(0))) {
    let rbt = loadOrCreateRewardByToken(ditb.account, addresses.seniorToken)
    let val = ditb.seniorTokenValue.toBigDecimal().times(rate)
    rbt.rewards = rbt.rewards.plus(val)
    rbt.save()
  }
  if (ditb.juniorTokenValue.gt(BigInt.fromI32(0))) {
    let rbt = loadOrCreateRewardByToken(ditb.account, addresses.juniorToken)
    let val = ditb.juniorTokenValue.toBigDecimal().times(rate)
    rbt.rewards = rbt.rewards.plus(val)
    rbt.save()
  }
}

export function calculateRewards(date: BigInt, pool: Pool): void {
  let investorIds = loadOrCreatePoolInvestors(pool.id)
  let systemRewards = loadOrCreateRewardDayTotal(date)
  checkRewardRate(systemRewards)
  let tokenAddresses = PoolAddresses.load(pool.id)

  for (let i = 0; i < investorIds.accounts.length; i++) {
    let accounts = investorIds.accounts
    let account = accounts[i]
    let ditb = RewardDailyInvestorTokenBalance.load(account.concat(pool.id).concat(date.toString()))
    let reward = loadOrCreateRewardBalance(ditb.account)

    updateInvestorRewardsByToken(
      <PoolAddresses>tokenAddresses,
      <RewardDailyInvestorTokenBalance>ditb,
      systemRewards.rewardRate
    )

    let tokenValues = ditb.seniorTokenValue.plus(ditb.juniorTokenValue).toBigDecimal()

    // add token values x rate to user rewards
    reward.pendingRewards = reward.pendingRewards.plus(tokenValues.times(systemRewards.rewardRate))

    if (rewardsAreEligible(date, reward.nonZeroBalanceSince)) {
      log.debug('transfer pending rewards to claimable:  {}', [date.toString()])
      reward.claimableRewards = reward.pendingRewards
      // reset pending rewards
      reward.pendingRewards = BigDecimal.fromString('0')
    }
    reward.totalRewards = reward.pendingRewards.plus(reward.claimableRewards)

    // add this user's pending rewards to today's rewards obj
    systemRewards.todayReward = systemRewards.todayReward.plus(reward.pendingRewards)
    systemRewards.save()
    reward.save()
  }
  // add yesterday's aggregate value to today's toDate aggregate
  let prevDayRewardId = date.minus(BigInt.fromI32(secondsInDay))
  let prevDayRewards = loadOrCreateRewardDayTotal(prevDayRewardId)
  systemRewards.toDateRewardAggregateValue = systemRewards.todayReward.plus(prevDayRewards.toDateRewardAggregateValue)
  systemRewards.save()
}

function checkRewardRate(checker: RewardDayTotal): void {
  if (checker.toDateRewardAggregateValue.gt(BigDecimal.fromString(tierOneRewards))) {
    log.debug('pending rewards > 1 MILL:  {}', [checker.toDateRewardAggregateValue.toString()])

    // TODO: update this with correct value
    checker.rewardRate = BigDecimal.fromString('0')
    checker.save()
  }
}

// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Pool extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Pool entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Pool entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Pool", id.toString(), this);
  }

  static load(id: string): Pool | null {
    return store.get("Pool", id) as Pool | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get loans(): Array<string> {
    let value = this.get("loans");
    return value.toStringArray();
  }

  set loans(value: Array<string>) {
    this.set("loans", Value.fromStringArray(value));
  }

  get totalDebt(): BigInt {
    let value = this.get("totalDebt");
    return value.toBigInt();
  }

  set totalDebt(value: BigInt) {
    this.set("totalDebt", Value.fromBigInt(value));
  }
}

export class Loan extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Loan entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Loan entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Loan", id.toString(), this);
  }

  static load(id: string): Loan | null {
    return store.get("Loan", id) as Loan | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get pool(): string {
    let value = this.get("pool");
    return value.toString();
  }

  set pool(value: string) {
    this.set("pool", Value.fromString(value));
  }

  get index(): i32 {
    let value = this.get("index");
    return value.toI32();
  }

  set index(value: i32) {
    this.set("index", Value.fromI32(value));
  }

  get owner(): Bytes {
    let value = this.get("owner");
    return value.toBytes();
  }

  set owner(value: Bytes) {
    this.set("owner", Value.fromBytes(value));
  }

  get opened(): i32 {
    let value = this.get("opened");
    return value.toI32();
  }

  set opened(value: i32) {
    this.set("opened", Value.fromI32(value));
  }

  get closed(): i32 {
    let value = this.get("closed");
    return value.toI32();
  }

  set closed(value: i32) {
    this.set("closed", Value.fromI32(value));
  }

  get debt(): BigInt {
    let value = this.get("debt");
    return value.toBigInt();
  }

  set debt(value: BigInt) {
    this.set("debt", Value.fromBigInt(value));
  }

  get interestRate(): i32 {
    let value = this.get("interestRate");
    return value.toI32();
  }

  set interestRate(value: i32) {
    this.set("interestRate", Value.fromI32(value));
  }

  get ceiling(): BigInt {
    let value = this.get("ceiling");
    return value.toBigInt();
  }

  set ceiling(value: BigInt) {
    this.set("ceiling", Value.fromBigInt(value));
  }

  get threshold(): BigInt {
    let value = this.get("threshold");
    return value.toBigInt();
  }

  set threshold(value: BigInt) {
    this.set("threshold", Value.fromBigInt(value));
  }

  get borrowsCount(): i32 {
    let value = this.get("borrowsCount");
    return value.toI32();
  }

  set borrowsCount(value: i32) {
    this.set("borrowsCount", Value.fromI32(value));
  }

  get borrowsAggregatedAmount(): BigInt {
    let value = this.get("borrowsAggregatedAmount");
    return value.toBigInt();
  }

  set borrowsAggregatedAmount(value: BigInt) {
    this.set("borrowsAggregatedAmount", Value.fromBigInt(value));
  }

  get repaysCount(): i32 {
    let value = this.get("repaysCount");
    return value.toI32();
  }

  set repaysCount(value: i32) {
    this.set("repaysCount", Value.fromI32(value));
  }

  get repaysAggregatedAmount(): BigInt {
    let value = this.get("repaysAggregatedAmount");
    return value.toBigInt();
  }

  set repaysAggregatedAmount(value: BigInt) {
    this.set("repaysAggregatedAmount", Value.fromBigInt(value));
  }
}

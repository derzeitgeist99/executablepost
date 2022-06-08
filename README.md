# Executable Post

Skin in the game for social media with executable posts for Lens Protocol

## Why

Internet has very short lived memory and it is easy to just 🐂💩 your way through. It is time to cut through the weeds and put money where your mouth is. We need an option to support your online claims with actions.

## What

Executable post is a post with smart contract in one. We don't know now what is the final usecase so many iterations are needed. The general idea is that your posts will encompass a logic that will be evaluated at a later time. This can have many flavours:

- a bet
- a reminder
- a personal feedback loop
- a transfer to charity

### Prototype: Self Evaluating bet

As a first step we will implement a simple logic:

1) create a post with your idea, and how you will evaluate it.
2) together with the post transfer some ETH into a contract and define beneficiary
3) after some time passes evaluate your claim. If you evaluate to true you get your money back. Otherwise the beneficiary will get the money.

## How

Let's build this step by step

➕ **Prototype**: Lens API + Stand Alone contract

➕➕ Convert to Lens Protocol Module

➕➕➕ Add Oracles to evaluate contract

➕➕➕➕ Add more smart contract resolution modes (followers voting, ?)

## Prototope: Definition of Done

### Elements

- Front End
- Smart Contract
- Connection to Lens API to post

### Front End Functionality (visible to user)

- Post
  - Input: Message, Beneficiary Address, Benefactor Address, TimeFrame, Amount (DAI)
  - Result: Post is visible on Lenster, contract is saved
- Resolve
  - Input: Beneficiary or Benefactor, message
  - Result: Comment with the result is visible on Lenster, money is transferred

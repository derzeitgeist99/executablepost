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


https://user-images.githubusercontent.com/11892101/183889081-0d489bf2-cb04-429a-9aa1-106625e71dd1.mp4


## Useful notes

- Contract is deployed on Polygon Mumbai testnet here: 

- Here is Readme for the [interface](docs/IExecutablePost.md)

- I cannot get a nice NatSpec for Library, so read about `DataTypes.Post` directly in the [contract](contracts/Helpers/DataTypes.sol)

- Since my contract is not whitelisted on Lens, I forked it. I am calling it here: 

- You can also lock any ERC20 tokens. 

- There are also multiple [tests](test) available.
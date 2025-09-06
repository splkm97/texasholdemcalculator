#!/usr/bin/env node

/**
 * Card Utils CLI
 * Command line interface for card utilities library
 */

import { Command } from 'commander'
import { createCard, createDeck, validateCards, parseCard, compareCards, getConstants } from '../src/card-utils'

const program = new Command()

program
  .name('card-utils')
  .description('Card utilities for poker applications')
  .version('1.0.0')

// Create card command
program
  .command('create')
  .description('Create a playing card')
  .requiredOption('-s, --suit <suit>', 'Card suit (hearts, diamonds, clubs, spades)')
  .requiredOption('-r, --rank <rank>', 'Card rank (A, 2-10, J, Q, K)')
  .option('-f, --format <format>', 'Output format (json, display)', 'json')
  .action((options) => {
    try {
      const card = createCard(options.suit, options.rank)
      
      if (options.format === 'display') {
        console.log(card.display)
      } else {
        console.log(JSON.stringify(card, null, 2))
      }
    } catch (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

// Create deck command
program
  .command('deck')
  .description('Create a deck of cards')
  .option('-c, --count', 'Show card count only')
  .option('-s, --shuffle', 'Shuffle the deck')
  .action((options) => {
    try {
      let deck = createDeck()
      
      if (options.shuffle) {
        // Import shuffle function
        const { shuffleDeck } = require('../src/deck')
        deck = shuffleDeck(deck)
      }
      
      if (options.count) {
        console.log(`Total cards: ${deck.totalCards}`)
        console.log(`Available: ${deck.availableCards.length}`)
        console.log(`Used: ${deck.usedCards.length}`)
      } else {
        console.log(JSON.stringify(deck, null, 2))
      }
    } catch (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

// Validate cards command
program
  .command('validate')
  .description('Validate array of cards')
  .requiredOption('-c, --cards <cards>', 'Comma-separated card strings (e.g., "AS,KH,QD")')
  .action((options) => {
    try {
      const cardStrings = options.cards.split(',')
      const cards = cardStrings.map(cardStr => parseCard(cardStr.trim()))
      
      const validation = validateCards(cards)
      
      if (validation.isValid) {
        console.log('✓ Cards are valid')
        console.log(`Validated ${cards.length} cards`)
      } else {
        console.log('✗ Validation failed')
        validation.errors.forEach(error => {
          console.log(`  ${error.code}: ${error.message}`)
        })
        process.exit(1)
      }
    } catch (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

// Parse card command
program
  .command('parse')
  .description('Parse card from string representation')
  .requiredOption('-c, --card <card>', 'Card string (e.g., "AS", "10H")')
  .option('-f, --format <format>', 'Output format (json, display)', 'json')
  .action((options) => {
    try {
      const card = parseCard(options.card)
      
      if (options.format === 'display') {
        console.log(`${card.display} (${card.suit} ${card.rank})`)
      } else {
        console.log(JSON.stringify(card, null, 2))
      }
    } catch (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

// Compare cards command
program
  .command('compare')
  .description('Compare two cards')
  .requiredOption('-1, --card1 <card1>', 'First card (e.g., "AS")')
  .requiredOption('-2, --card2 <card2>', 'Second card (e.g., "KH")')
  .option('--ace-low', 'Treat ace as low (1) instead of high (14)')
  .action((options) => {
    try {
      const card1 = parseCard(options.card1)
      const card2 = parseCard(options.card2)
      const aceHigh = !options.aceLow
      
      const result = compareCards(card1, card2, aceHigh)
      
      console.log(`Comparing ${card1.display} vs ${card2.display}`)
      console.log(`Result: ${result.result}`)
      console.log(`Reasoning: ${result.reasoning}`)
      
      if (result.result > 0) {
        console.log(`Winner: ${card1.display}`)
      } else if (result.result < 0) {
        console.log(`Winner: ${card2.display}`)
      } else {
        console.log('Tie')
      }
    } catch (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

// Constants command
program
  .command('constants')
  .description('Show poker constants and configurations')
  .action(() => {
    const constants = getConstants()
    console.log(JSON.stringify(constants, null, 2))
  })

// Examples command
program
  .command('examples')
  .description('Show usage examples')
  .action(() => {
    console.log(`
Card Utils CLI Examples:

Create a card:
  card-utils create --suit hearts --rank A
  card-utils create -s spades -r K --format display

Create a deck:
  card-utils deck
  card-utils deck --count
  card-utils deck --shuffle

Validate cards:
  card-utils validate --cards "AS,KH,QD"
  card-utils validate -c "10S,JH,QC,KD,AS"

Parse a card:
  card-utils parse --card AS
  card-utils parse -c 10H --format display

Compare cards:
  card-utils compare --card1 AS --card2 KH
  card-utils compare -1 AS -2 2H --ace-low

Show constants:
  card-utils constants
`)
  })

// Handle unknown commands
program.on('command:*', (operands) => {
  console.error(`Unknown command: ${operands[0]}`)
  console.error('See --help for available commands')
  process.exit(1)
})

// Show help if no command provided
if (process.argv.length <= 2) {
  program.help()
}

program.parse()

export { program }
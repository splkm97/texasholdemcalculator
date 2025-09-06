#!/usr/bin/env node

/**
 * Poker Engine CLI
 * Command line interface for poker probability calculations and hand evaluation
 */

import { Command } from 'commander'
import { calculateProbabilities, evaluateHand, checkHealth } from '../src/poker-engine'
import { parseCard } from '../../card-utils/src/card-utils'

const program = new Command()

program
  .name('poker-engine')
  .description('Texas Hold\'em probability calculation engine')
  .version('1.0.0')

// Calculate probabilities command
program
  .command('calculate')
  .description('Calculate hand probabilities')
  .requiredOption('-p, --player <cards>', 'Player hole cards (e.g., "AS,AH")')
  .option('-c, --community <cards>', 'Community cards (e.g., "KS,QH,JD")', '')
  .option('-s, --stage <stage>', 'Game stage', 'pre-flop')
  .option('-m, --method <method>', 'Calculation method (auto, lookup, simulation, exact)', 'auto')
  .option('-f, --format <format>', 'Output format (json, table)', 'table')
  .action(async (options) => {
    try {
      // Parse player cards
      const playerCardStrings = options.player.split(',')
      const playerHand = playerCardStrings.map(cardStr => parseCard(cardStr.trim()))

      // Parse community cards
      let communityCards = []
      if (options.community) {
        const communityCardStrings = options.community.split(',')
        communityCards = communityCardStrings.map(cardStr => parseCard(cardStr.trim()))
      }

      // Calculate probabilities
      const results = await calculateProbabilities({
        playerHand,
        communityCards,
        stage: options.stage,
        preferredMethod: options.method
      })

      if (options.format === 'json') {
        console.log(JSON.stringify(results, null, 2))
      } else {
        // Table format
        console.log(`\nPoker Probability Calculation Results`)
        console.log(`=====================================`)
        console.log(`Stage: ${results.stage}`)
        console.log(`Player Hand: ${playerHand.map(c => c.display).join(' ')}`)
        if (communityCards.length > 0) {
          console.log(`Community: ${communityCards.map(c => c.display).join(' ')}`)
        }
        console.log(`Method: ${results.method}`)
        console.log(`Calculation Time: ${results.calculationTime.toFixed(2)}ms`)
        console.log()

        // Probability table
        console.log('Hand Type              Probability  Percentage   Odds     Occurrences')
        console.log('─────────────────────────────────────────────────────────────────────')
        
        results.probabilities.forEach(prob => {
          const handName = getHandName(prob.handType).padEnd(20)
          const probability = prob.probability.toFixed(6).padStart(10)
          const percentage = `${prob.percentage.toFixed(2)}%`.padStart(10)
          const odds = prob.odds.padStart(8)
          const occurrences = prob.occurrences.toString().padStart(10)
          
          console.log(`${handName} ${probability}  ${percentage} ${odds}  ${occurrences}`)
        })
      }
    } catch (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

// Evaluate hand command
program
  .command('evaluate')
  .description('Evaluate best 5-card hand from given cards')
  .requiredOption('-c, --cards <cards>', 'Cards to evaluate (5-7 cards, e.g., "AS,AH,KS,QH,JD")')
  .option('-f, --format <format>', 'Output format (json, text)', 'text')
  .action((options) => {
    try {
      const cardStrings = options.cards.split(',')
      const cards = cardStrings.map(cardStr => parseCard(cardStr.trim()))

      const evaluation = evaluateHand({ cards })

      if (options.format === 'json') {
        console.log(JSON.stringify(evaluation, null, 2))
      } else {
        console.log(`\nHand Evaluation Results`)
        console.log(`======================`)
        console.log(`Input Cards: ${cards.map(c => c.display).join(' ')}`)
        console.log(`Best Hand: ${evaluation.bestHand.map(c => c.display).join(' ')}`)
        console.log(`Hand Strength: ${evaluation.handStrength}`)
        console.log(`Description: ${evaluation.description}`)
        
        if (evaluation.kickers.length > 0) {
          console.log(`Kickers: ${evaluation.kickers.map(c => c.display).join(' ')}`)
        }
      }
    } catch (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

// Health check command
program
  .command('health')
  .description('Check engine health status')
  .action(() => {
    const health = checkHealth()
    
    console.log(`\nPoker Engine Health Check`)
    console.log(`========================`)
    console.log(`Status: ${health.status}`)
    console.log(`Version: ${health.version}`)
    console.log(`Lookup Tables Loaded: ${health.lookupTablesLoaded ? '✓' : '✗'}`)
    console.log(`Average Calculation Time: ${health.performance.avgCalculationTime}ms`)
    console.log(`Cache Hit Rate: ${(health.performance.cacheHitRate * 100).toFixed(1)}%`)
  })

// Benchmark command
program
  .command('benchmark')
  .description('Run performance benchmarks')
  .option('-n, --iterations <n>', 'Number of iterations', '1000')
  .action(async (options) => {
    const iterations = parseInt(options.iterations)
    
    console.log(`Running benchmark with ${iterations} iterations...`)
    
    try {
      const playerHand = [parseCard('AS'), parseCard('AH')]
      const startTime = performance.now()
      
      for (let i = 0; i < iterations; i++) {
        await calculateProbabilities({
          playerHand,
          communityCards: [],
          stage: 'pre-flop'
        })
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      const avgTime = totalTime / iterations
      
      console.log(`\nBenchmark Results`)
      console.log(`================`)
      console.log(`Total Time: ${totalTime.toFixed(2)}ms`)
      console.log(`Average Time: ${avgTime.toFixed(2)}ms per calculation`)
      console.log(`Throughput: ${(1000 / avgTime).toFixed(0)} calculations per second`)
      
      if (avgTime > 100) {
        console.log('⚠️  Warning: Average calculation time exceeds 100ms target')
      } else {
        console.log('✓ Performance target met (<100ms per calculation)')
      }
    } catch (error) {
      console.error('Benchmark failed:', error.message)
      process.exit(1)
    }
  })

// Examples command
program
  .command('examples')
  .description('Show usage examples')
  .action(() => {
    console.log(`
Poker Engine CLI Examples:

Calculate pre-flop probabilities:
  poker-engine calculate --player "AS,AH"
  poker-engine calculate -p "KS,QH" --stage pre-flop

Calculate flop probabilities:
  poker-engine calculate -p "AS,AH" -c "KS,QH,JD" --stage flop

Calculate with specific method:
  poker-engine calculate -p "AS,AH" --method simulation
  poker-engine calculate -p "AS,AH" -c "KS,QH,JD" -m exact

Evaluate a hand:
  poker-engine evaluate --cards "AS,AH,KS,QH,JD"
  poker-engine evaluate -c "10S,JS,QS,KS,AS" --format json

Check health:
  poker-engine health

Run benchmarks:
  poker-engine benchmark
  poker-engine benchmark --iterations 5000
`)
  })

// Helper function to get hand name
function getHandName(handStrength: number): string {
  const names = [
    'High Card',
    'One Pair', 
    'Two Pair',
    'Three of a Kind',
    'Straight',
    'Flush',
    'Full House',
    'Four of a Kind',
    'Straight Flush',
    'Royal Flush'
  ]
  return names[handStrength] || 'Unknown'
}

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
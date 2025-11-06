# Ethereum Zap UI Component - Code Reference Example

A React TypeScript implementation of a DeFi "Zap" user interface component for Ethereum-based liquidity pool operations. This code example demonstrates how to build a Web3-integrated zap out functionality that allows users to withdraw from liquidity pools and receive tokens in various formats.

## Overview

This is a **code reference example** extracted from a larger project. It demonstrates a complete implementation of a Zap UI component that integrates with Ethereum smart contracts, specifically for liquidity pool withdrawal operations. The component is not a standalone runnable project but serves as a reference for implementing similar DeFi functionality.

### What is a Zap?

In DeFi (Decentralized Finance), a "Zap" is a mechanism that allows users to convert between different asset types in a single transaction. This component focuses on **Zap Out** functionality, enabling users to:

- Withdraw liquidity from LP (Liquidity Provider) tokens
- Convert LP tokens back into underlying assets
- Choose to receive Token A, Token B, or Wrapped ONE (WONE)
- Perform these operations across multiple DEX routers

## Key Features

### 🎯 Core Functionality

- **Multi-Router Support**: Works with various DEX routers (filtered selection)
- **LP Token Selection**: Dynamic selection of liquidity pool tokens based on selected router
- **Flexible Withdrawal Options**: 
  - Receive Token A
  - Receive Token B
  - Receive Wrapped ONE (WONE)
  - Receive Both Tokens (coming soon)
- **Real-time Price Estimation**: Shows estimated output amounts based on current pool ratios
- **Token Approval Workflow**: Handles ERC-20 token approvals automatically
- **Transaction Management**: Full transaction lifecycle with pending, success, and error states

### 🔧 Technical Features

- **Web3 Integration**: Uses `@web3-react/core` and `@ethersproject` for blockchain interactions
- **Form Management**: React Hook Form for form state and validation
- **Data Fetching**: React Query for efficient data fetching and caching
- **Error Handling**: Comprehensive error boundaries and error modals
- **TypeScript**: Fully typed for better developer experience
- **Responsive UI**: Tailwind CSS styling with dark mode support

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Web3 Libraries**:
  - `@web3-react/core` - Web3 connection management
  - `@ethersproject/units` - Ethereum unit conversions
  - `@ethersproject/bignumber` - Big number operations
  - `@ethersproject/contracts` - Smart contract interactions
- **Form Management**: `react-hook-form`
- **Data Fetching**: `react-query`
- **Styling**: Tailwind CSS with `clsx` for conditional classes
- **Notifications**: `react-hot-toast`
- **Error Handling**: `react-error-boundary`

## Project Structure

```
ethereum-zap-ui-example/
├── index.tsx                    # Main Zap component with tab navigation
├── ZapIn/
│   └── index.tsx                # Zap In component (coming soon)
└── ZapOut/
    ├── index.tsx                # Main Zap Out form component
    ├── FormElementWrapper/
    │   └── index.tsx            # Form element wrapper component
    ├── Information/
    │   └── index.tsx            # Information section (fees, links)
    ├── Label/
    │   └── index.tsx            # Form label component
    ├── LPTokenSelect/
    │   └── index.tsx            # LP token selection dropdown
    ├── RouterSelect/
    │   └── index.tsx            # DEX router selection dropdown
    └── ZapOutTypeSelect/
        └── index.tsx            # Zap out type selection (Token A/B/ONE)
```

## Component Architecture

### Main Components

#### `Zap` (index.tsx)
The root component that provides tabbed interface for Zap In (coming soon) and Zap Out operations.

#### `ZapOut`
The main form component that handles:
- Router selection
- LP token selection based on router
- Amount input with balance validation
- Zap out type selection
- Token approval and transaction submission

**Key Features:**
- Real-time balance fetching
- Allowance checking and approval flow
- Transaction state management
- Form validation
- Error handling

#### `ZapOutTypeSelect`
Selects the output token type with real-time price estimation:
- Calculates estimated output based on LP pool ratios
- Fetches swap rates from router contracts
- Displays estimated amounts for Token A and Token B options

#### `LPTokenSelect`
Dynamic LP token selection:
- Filters tokens by selected router
- Displays token logos
- Auto-selects first available token

#### `RouterSelect`
DEX router selection with filtering:
- Excludes routers without supported LP tokens
- Shows router logos and names

## Smart Contract Integration

The component integrates with the Zap contract referenced in the comments:
- **Contract Repository**: [FarmersOnlyFi Contracts](https://github.com/FarmersOnlyFi/farmersonlyfi-contracts/blob/master/contracts/Vault2/Zap.sol)
- **Main Function**: `zapOutToken()` - Handles the zap out transaction

### Contract Interaction Flow

1. **Check Balance**: Query user's LP token balance
2. **Check Allowance**: Verify token approval for Zap contract
3. **Approve** (if needed): Approve Zap contract to spend LP tokens
4. **Zap Out**: Execute `zapOutToken()` with:
   - LP token address
   - Amount to zap
   - Target token address
   - Router address
   - Swap paths for both tokens

## Usage Notes

⚠️ **Important**: This is a code reference example, not a standalone project.

### Dependencies Required

This component expects the following dependencies from the parent project:

- Web3 configuration (`config/web3/*`)
- Contract addresses (`config/constants/contract-addresses`)
- Token configurations (`config/web3/tokens`)
- LP token configurations (`config/web3/lp-tokens`)
- Router configurations (`config/web3/routers`)
- UI components (`components/*`)
- Utility functions (`utils/*`)
- Services (`services/*`)
- ABIs (`config/abi/*`)

### Integration Points

To use this component in your project, you'll need:

1. **Web3 Provider Setup**: Connect wallet using `@web3-react/core`
2. **Configuration Files**: Set up token, router, and LP token configs
3. **Contract ABIs**: Include HRC20, LPToken, and Router ABIs
4. **UI Component Library**: Implement or adapt the referenced UI components
5. **Utility Functions**: Balance formatting, contract helpers, etc.

## Code Patterns and Best Practices

### Form Handling
- Uses `react-hook-form` for form state management
- Real-time validation with custom validators
- Watched fields for dependent calculations

### Web3 Integration
- Uses React Query for blockchain data fetching
- Automatic refetching on chain/account changes
- Error boundaries for graceful error handling

### State Management
- Local state with `useState` for UI state
- React Query for server/blockchain state
- Form state managed by React Hook Form

### Transaction Handling
- Toast notifications for transaction states
- Error modals for transaction failures
- Automatic cache invalidation on success

## SEO Keywords

This code example is relevant for developers searching for:

- Ethereum DeFi UI components
- Liquidity pool withdrawal interface
- Web3 React components
- Zap functionality implementation
- LP token conversion UI
- DeFi frontend development
- React TypeScript Web3 integration
- Smart contract UI patterns
- Uniswap-style router integration
- Token approval workflow

## Related Concepts

- **DeFi (Decentralized Finance)**: The broader ecosystem this component operates in
- **Liquidity Pools**: Pools of tokens that provide liquidity to DEXs
- **LP Tokens**: Tokens representing liquidity provider positions
- **DEX Routers**: Smart contracts that handle token swaps across multiple paths
- **Zap Contracts**: Smart contracts that simplify complex DeFi operations
- **Token Approvals**: ERC-20 token spending permissions

## License and Attribution

This code is provided as a reference example. Please ensure you have appropriate permissions and licenses before using this code in your projects.

## Contributing

This is a code reference example extracted from a larger project. If you're adapting this code:

1. Ensure all dependencies are properly installed
2. Configure your Web3 environment
3. Set up required configuration files
4. Adapt UI components to match your design system
5. Test thoroughly on testnets before mainnet deployment

## Disclaimer

This code is provided as a reference example only. Always:
- Audit smart contracts before use
- Test thoroughly on testnets
- Verify token addresses and contract ABIs
- Implement proper error handling
- Consider security best practices
- Consult with security experts for production deployments

---

**Note**: This README describes a code reference example extracted from a larger project. The component cannot run standalone and requires integration into a complete application with proper configuration, dependencies, and infrastructure.
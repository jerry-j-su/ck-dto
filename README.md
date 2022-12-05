# Cloud Kitchen DTO Client
- [Quick Start](#quick-start)
- [Features](#features)
  - [Overall data flow](#overall-data-flow)
  - [Data Structure](#data-structure)
  - [Quick Search on Price and ID](#quick-search-on-price-and-id)
  - [App state](#app-state)
  - [On-Demand DOM Render](#on-demand-dom-render)
  - [Socket service layer](#socket-service-layer)
  - [View components](#view-components)
  - [Style](#style)
- [Tests](#tests)
- [Build](#build)

## Quick Start
In the project directory, run:
```
npm install
```
After the installation, run:
```
npm run start
```
The app will start in the development mode via:  
[http://localhost:3000](http://localhost:3000)  
view it in the browser with the data sever (NOT included in this repository) running at [http://localhost:4000](http://localhost:4000) to feed the client with order stream


## Features
### Overall data flow
Order flow server -> socket service layer -> app state -> Rendered by `<OrderList />` Component

### Data Structure
Orders are stored in a **Fixed Width 2-Dimensional Array**    
All blocks in the array are themselves **fixed-length** sub-arrays, new block will be created with pre-defined block size once the previous block is filled  
It has no array size-change and avoids costly memory-reallocation and copying, especially when the amount of orders accumulates to an overwhelming level  
> Please see [src/utils/fixed2DArray.ts](src/utils/fixed2DArray.ts), which is used by [useOrders.ts](src/state/useOrders.ts) as its order storage

### Quick Search on Price and ID
Order's **price** and **ID** are **Reverse Indexed**, so that the time complexity of search on price or ID could be kept as `O(1)` regardless of the accumulated order count  
> Please see [src/utils/reverseIndexMap.ts](src/utils/reverseIndexMap.ts), which used by [useOrders.ts](src/state/useOrders.ts) when reverse-indexing new orders

### App state
currently there is only order-related state as it is a simple app  
> see [src/state/useOrders.ts](src/state/useOrders.ts)  

It utilizes a customized global state hook ([src/utils/createGlobalPersistentState.ts](src/utils/createGlobalPersistentState.ts)) for components to access global state at any layer,  
avoiding the need to import a centralized and clustered **Store-like** state management such as **Redux**  

### On-Demand DOM Render
Given the nature of the large order count, a very long order list/table is expected.  
To avoid performance drawback due to a huge DOM tree, the app only renders orders which are near the viewable area (Order list is contained inside a scrollable viewport container).  
More orders can be dynamically attached to the list as user scrolls closer to the bottom  
View position is calculated(**throttled**) upon user scroll  
> Please see [src/components/dynamicScrollableListHOC.tsx](src/components/dynamicScrollableListHOC.tsx), a HOC that wraps the `<OrderList />` component to limits its DOM count and boosts its render performance.

### Socket service layer
see [src/service.ts](src/service.ts)  
Connects backend server and receives order packets stream  

### View components
- `<SearchBox />`  
> see [src/components/SearchBox.tsx](src/components/SearchBox.tsx)

For user to quickly filter orders by typed amount  
Simple UI validation  
Search is **debounced** to avoid costly re-render caused by quick user input  
- `<OrderList />`  
> see [src/components/OrderList.tsx](src/components/OrderList.tsx)
Shows all orders as required, or filtered ones upon user query

### Style
Basic style via **Sass** preprocessor


## Tests
run
```
npm run test
```
to launch the test runner  
or  run
```
npm run test-coverage
```
for coverage report (under `/ut_coverage`)  
Current coverage: **85.11%** (by statements)  
After test run, open this [lcov report](/ut_coverage/lcov-report/index.html) with browser to review the current UT coverage

## Build
Not covered here since it is a quick challenge. No production requirement is in-scoped

# Cloud Kitchen DTO Client
- [Quick Start](#quick-start)
- [Tests](#tests)
- [Features](#features)
  - [Overall data flow](#overall-data-flow)
  - [Socket service layer](#socket-service-layer)
  - [App state](#app-state)
  - [View components](#view-components)
  - [Style](#style)
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
Current rate by statements: *86.42%*  
After test run, open this [lcov report](/ut_coverage/lcov-report/index.html) with browser to review the current UT coverage

## Features
### Overall data flow
Order flow server -> socket service layer -> app state -> Rendered by `<OrderList />` Component
### Socket service layer
see [src/service.ts](src/service.ts)  
Connects backend server and receives order packets stream  
> [TODO] Buffer/Cache mechanism for high TPS stream
### App state
see [src/state/useOrderFlow.ts](src/state/useOrderFlow.ts)  
Customized hook to store App state,  
With handlers to add, update and filter orders as required   
> currently there is only order-related state as it is a simple app
### View components
- `<SearchBox />`  
see [src/components/SearchBox.tsx](src/components/SearchBox.tsx)  
For user to quickly filter orders by typed amount  
Simple UI validation  
Debounced search to avoid costly re-render caused by user input  
- `<OrderList />`  
see [src/components/OrderList.tsx](src/components/OrderList.tsx)  
Shows all orders as required, or filtered ones upon user query
### Style
Basic style via **Sass** preprocessor
 

## Build
Not covered here since it is a quick challenge. No production requirement is in-scoped

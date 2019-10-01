#hivectrl

A basic npm package using promises and server-side fetch to perform authenticated requests to the hiveos api v2 as **per provided javascript sample**

##quickstart

Modify config.json with your hiveos information. ```npm install && npm start```. Access localhost:5000/api (default port). A front end display in progress is available @  localhost:5000/

##the problem

Modifying video card settings on large multi-card-type rigs is very cumbersome; cards must be configured one at a time (which can take a while on a 10 card rig with differing cards)


##intentions

* A better front end interface for manipulating mining rigs; specifically the ability to have better control over flight-sheets and the ability to apply changes per card 'type'.

* Better color coded dashboard interface for visualizing rig/farm/card activity in 'real time (15 seconds)'

* Improve ability to create new flight-sheets from existing ones

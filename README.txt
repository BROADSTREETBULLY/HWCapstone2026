Schedulr

Schedulr is an app for architecture and interior design practices to manage their product specifications and project schedules.
At the moment most practices do this in Excel. 
Specs get copy-pasted from one project to the next, they go out of date without anyone noticing, 
and when a builder asks what was issued six months ago there is no way to prove it. 
Schedulr keeps all the practice's specs in one shared library, lets each project pull from it, 
and ensure previous item and schedule version stay immutable. 


What it does:

-   Org library - the practice's shared spec database, split into Furniture, FF&E and Finishes. 
    Searchable and filterable, with set sub categories (Chair, Carpet, Appliances etc).
-   Projects and schedules - each project has its own schedules. You can add a spec from the library with the search bar, 
    or make a new one straight in the schedule. New specs stay local to that project until they get pushed to the org. library.
-   Versions - editing a spec never overwrites it. Every edit makes a new version and you can look back through the history.
-   Options - the same product in different colours or finishes are kept as options under one spec. 
    You can look through them with images and swap a schedule row over to a different one.
-   Push to org - a spec made or changed in a schedule can be pushed to the org library. 
    A pop up lets you delete anything project specific first and pick which category it goes in. The library gets the cleaned copy, 
    the schedule keeps its full text.
-   User libraries - your own folders of spec copies that you can edit. Changes can be pushed back to the original spec as a new version.

Built with

Frontend: React 19, Vite, Material UI, MUI X DataGrid, React Router
Backend: Node.js, Express, JWT for login
Database: MongoDB with Mongoose
Testing: Jest and Supertest (63 tests)

How the data is set up

Project -> Schedule -> ScheduleItem, and the schedule item points at a SpecOption.
Spec -> SpecOption -> SpecVersion. 
The option has a currentVersionID that points at whichever version is live, 
so when a new version is made the pointer moves and the schedule row shows the new text automatically.
Spec text is typed as free text like "Product: X" on one line and "Finish: Y" on the next. 
It gets saved exactly as typed and also split into key/value pairs by src/services/specTextParser.js.

Before you start
You need Node.js 18 or newer, and MongoDB running on your machine.

Setting it up
1. Backend

cd backend
npm install

Make a file called .env in the backend folder with:

DB_URI=mongodb://localhost/Capstone26
JWT_SECRET=<any long random string>

DB_URI is optional, that one is the default.

Open MongoDB Compass and connect to mongodb://localhost. 
Make a database called Capstone26 with a collection called organisations. 
Insert one document into it, { "orgName": "Test Practice" } is enough, and copy down its _id. 
That _id is the orgId you use when you register a user further down. 
Organisations are practice level admin so there are no routes for them on purpose. 
Everything else (projects, schedules, specs, libraries) gets made in the app.

Then start it:

npm start

or `npm run dev` if you want nodemon. It runs on http://localhost:3000/api

2. Frontend

cd frontend
npm install
npm run dev

Open the link it prints, usually http://localhost:5173. 
Vite sends anything starting with /api to the backend so you don't need to set up CORS.

3. Making a user
There is no sign up page yet so register through Thunder Client:

POST http://localhost:3000/api/users/register
{ "username": "demo", "password": "...", "email": "...",
  "firstName": "...", "lastName": "...", "orgId": "<the Organisation _id>" }

Then log in through the app with that username and password.


Using it

Dashboard - your recent projects and their schedules, and the New Project button.

Libraries - the three org libraries in the sidebar. Double click a row to edit it (this saves as a new version). 
Each row has buttons for Previous Versions, Options, Add to Library and Add to Schedule.

Schedules - you get to these through a project. The search bar adds specs from the org library, 
New Spec adds a blank row at the top, and double clicking a row lets you type into it. 
Options shows the other variants of that spec so you can add one or swap the row over. PUSH TO ORG opens the clean up pop up.

My Libraries - your own collections. Same editing and options, and you can push your changes back to the original.

Testing

cd backend
npm test

63 Jest tests covering login, schedules, schedule items, specs, options, versions, 
user libraries and the push to library flows. 
The project routes are not in the automated tests, those were tested by hand.

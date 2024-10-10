
[ReFactoring Changes Documented Here](https://docs.google.com/document/d/1zkYXJVlZqBako1E4Q2pL_oYqsKKaooUW2M7D_NXOs6U/edit?usp=sharing)

We used :-
Plato: A tool for analyzing JavaScript code complexity and generating visual reports.
ESLint: A tool for identifying and fixing problems in JavaScript code through static analysis.
Jest: A testing framework for writing and running unit tests, with a focus on React applications.

- All test utilities are incorporated in github workflow to run automatically on every commit. 
- Workflow run history can be found under Actions tab with reports present under artifacts.
- Plato analysis report can be found in reports/plato directory.
- Test Coverage reports can be found in artifacts.
- Progress from Initial to Final is shown in Progress_Report.
  
```
#CS455_Assignment-1
In Mind Game, you quickly memorize a group of tiles on a grid. That means remembering their location, and maybe even the shapes they create.
This task challenges a part of your short-term memory called spatial recall — your ability to track location and position within an environment.

The File structure is as follows:

concentration-game/
│
├── public/
│ ├── index.html
│ ├── favicon.ico
│
├── documentation/
│ ├── project.jpg
├── server/
| | ├── models/
│ │ ├── User.js
| | ├── routes/
│ │ ├── authRoutes.js
│ │ ├── game.js
│ ├── server.js
│ ├── db.js
│ ├── package.json
│ ├── package-lock.json
| | 
├── src/
| | ├── tests/
│ │ ├── Board.test.js
│ │ ├── Game.test.js
│ │ ├── LeaderBoard.test.js
│ │ ├── LoginPage.test.js
│ │ ├── ServerToDb.test.js
│ │ ├── Home.test.js
│ │ ├── Instruction.test.js
│ │ └── AudioPlayer.test.js
│ │ ├── Util.test.js
| |
│ ├── components/
│ │ ├── Board.js
│ │ ├── Game.js
│ │ ├── Home.js
│ │ ├── Instruction.js
│ │ └── AudioPlayer.js
│ │ ├── Util.js
│ │ ├── Board.css
│ │ └── AudioPlayer.css
│ │ └── Game.css
│ │ └── Home.css
│ │ └── LeaderBoard.css
│ │ └── LeaderBoard.js
│ │ └── LoginPage.css
│ │ └── LoginPage.js
│ │ └── Instruction.css
│ │
│ ├── assets/
│ │ └── background-sound.mp3
│ │
│ ├── images/
│ │ └── concentration_game.jpg
│ │ └── concentration_instructions.jpg
│ │ └── wood3.jpg
│ │
│ ├── App.js
│ └── index.js
│
└── package.json
└──.babelrc
└──.eslintignore
└──.eslintrc.js
└──.eslintrc.json
└──.platoignore
```

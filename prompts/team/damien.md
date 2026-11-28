> Original prompts, verbatim, as provided by Damien on 28 Nov 2026 (mostly French). Prompt 8 was not provided. AI tool: [not stated].

# Prompts: Damien

Source: `team/damien/Original_prompts_DV.docx`, converted to text with macOS `textutil`. Each prompt is reproduced unchanged inside a text block; only the Markdown headings were added.

## Original prompts

Document title: *Prompts originaux (bruts)*

### Prompt 1

```text
Pièce jointe : module outline du cours
Hello, j'ai besoin de toi pour un nouveau travail. Cette fois un travail de groupe à faire à trois avec mes colocs. Il concerne le cours 'Building your own wealth'
Je te mets le module outline du cours.
Et la consigne du travail de groupe


Team Assignment
Wealth Management Application Development
Objective
Students will work in groups of up to three members to design and develop a functional application that helps users manage and/or monitor their personal or family wealth.
Assignment Brief
The application may focus on budgeting, portfolio tracking, asset allocation, investment monitoring, risk analysis, savings goals, retirement planning, or another relevant wealth-management function.
Team Registration:

* Teams and project ideas must be formed and registered during the first teaching session
* Project topics allocated on a first-come, first-served basis
* Deadline for team formation: midnight on the day of the first teaching session

AI Integration:

* Students are encouraged to use any coding-oriented AI model to support the development process
* The objective is to create a working application and demonstrate effective use of AI-assisted software development tools

Submission Requirements (Single ZIP Folder):

* All prompts used during the development process
* The complete source code of the application
* A document describing the application's purpose, key features, and intended users
* A link to a live demo accessible through any standard web browser

Weighting:

* 40% towards final mark


On a déjà notre idée de produit, qui a été validée par le professeur


1. PROBLEM

Trackers show what you own, not whether your risk fits your situation. Robo-advisors and AI chatbots default to conservative advice as they cannot see future earnings, job risk or true loss tolerance, leaving young, risk-seeking investors with little guidance.


2. CORE MODULE: PORTFOLIO TRACKER
Some of the key Features:
• Net worth across all bank and brokerage accounts
• Transactions, performance and benchmarking (indices, gold, Bitcoin)
• Breakdown by asset class, region, sector and currency
• ETF look-through for overlaps and over- or underweights
• Dividend tracking
• Star investor portfolios (e.g. via 13F filings) to compare with and copy, fully or partly


3. ADD-ON: AI STRATEGY LAYER BASED ON HUMAN CAPITAL

• Basis: lifecycle and human capital research (e.g. Ayres and Nalebuff; Ibbotson et al.). Young investors with high future earnings can take more risk; bond-like incomes support more equities, stock-like incomes more bonds
• Onboarding questionnaire (15 to 20 questions) on age, education, income outlook, job stability, inheritance, savings rate, horizon and loss tolerance etc.
• Human capital score that sets a target risk level, potentially above 100% equity exposure for young users
• Specialist AI agents (equities, ETFs incl. leveraged, bonds, precious metals, crypto) under a lead agent, suggesting products that fit the user's profile and portfolio
• Focus on high-risk, high-return strategies, with clear risk explanations
• Alerts when actual risk drifts from the target


4. TARGET USERS

Students and young professionals with limited capital but high expected earnings, and anyone wanting a total-wealth view.

Dans un premier temps, on doit préparer la présentation de notre idée, lors de la dernière session de la semaine d'electif.

Globalement il faut faire cela
The assignement for tomorrow is just to present the idea we got with some points such as : the pain, the solution, the product etc.
We don't need to showcase screenshots of the product, we can just talk about the idea we got.
It is maximum 10min, and can be less

Donc pas encore besoin de le produit en tant que tel, on a juste besoin d'un ppt bref pour demain qui prends moins de 10min à présenter (ça peut tres bien etre 7-8min)
J'ai donc besoin de toi pour créer le ppt associé à la présentation de notre idée

Je vais te mettre un template de pitch deck dont tu peux t'inspirer, ainsi qu'un ppt que j'ai fait avec l'aide de claude pour un autre rendu pour que tu ais une idée des couleurs stellenbosch et de ce que j'ai déjà pu faire. Mais inspire toi plus du template first mile en adaptant avec les couleurs et le coté un peu plus scolaire stellenbosch
```

### Prompt 2

```text
Pièces jointes : 2 fichiers (template de pitch deck et PPT précédent)
Voici les 2 fichiers, tu peux mtn faire la présentation, tu n'es pas obligé de remplir toutes les sections du template first mile. L'idée est surtout que tu puisses avoir des templates utiles pour nous ce qu'on doit faire
```

### Prompt 3

```text
en fait inspire toi plus du template first mile stp

La ca fait trop AI et les couelurs sont trop sombres je trouve
```

### Prompt 4

```text
Je vais faire les slides 1 à 3, est ce que tu peux me faire un prompt pour parler 2min30
```

### Prompt 5

```text
Tu peux donner un nom au projet dans les slides stp

Et aussi donner un texte pour moi et Jens pour la prez, ça doit faire dans les 8mins pour rappel
```

### Prompt 6

```text
Pourquoi tu parles de human capital dans les slides, ça veut pas dire la meme chose que future earnings non ?
```

### Prompt 7

```text
modifie le prompt avec le bon nom
```

### Prompt 9

```text
Pièce jointe : la version de la présentation
Ok mtn on doit dev l'app je te mets la version qu'on a prez finalement

Le gars qui va dev dans notre groupe as envoyé un message pour demander de taffer

Hey guys, I'm starting to build the Human Capital Copilot demo now and need your input before I move on. The spec and build plan are here: [link]. Please send me the following by [day/time], unless a task has its own date below:

1. Your notes (both of you)
Anything you have on the idea, features or design: notes, sketches, apps you like. Bullet points are fine. If you have nothing, just tell me so I know to go from the spec.

2. User flow, screen by screen (Jens) – More urgent
This one comes first, so I build it right the first time instead of doing double work. Read the spec, then write what the user sees and does on each screen: landing → onboarding (20 questions) → results → portfolio → plan → alerts → AI chat. For each screen: what's on it, what you can click, and what happens next. Flag anything in the spec you disagree with.

3. Demo data (Damien) – by no later than 30 Nov
- 3 example brokerage accounts (holdings, amounts, currency)
- ~10 popular ETFs with their top holdings and region/sector split, taken from the official factsheets. Include the link and date for each one.
All seed data has to be real: real tickers, real prices and real factsheet figures as of a stated date. Nothing made up, since the app's numbers are built on it.

4. AI chat test script (Jens)
10–15 questions a user would ask the in-app AI, with what a good answer looks like, plus 3–5 it should refuse (e.g. "should I buy Tesla now?").

5. Application description (Damien)
First draft of the document we have to submit: the problem, our solution, key features, target users and the research behind it (Ayres & Nalebuff, Ibbotson et al.). 2–3 pages.

If you use ChatGPT/Claude for any of this, save your prompts in a doc. We have to hand in every prompt, and "Use of AI" is 20% of the grade.

Swap tasks between you if you prefer, just tell me who has what so I can document it.

I'll then build the demo using claude code and git.

If you can't make any of these dates, please let me know as soon as possible so I can plan around it. Thanks!


Tu peux m'expliquer ce que je dois faire en soit stp
```

### Prompt 10

```text
1.

dans mes idées dis lui qu'on peut se baser sur le design de Finary https://finary.com/en, donne lui les grosses lignes de la prez sur l'idée qu'on a et ça sera déjà très bien
```

### Prompt 11

```text
plus court les bullets, et met un bullet qu'on avait mis comme nom de prez Headroom mais que je suis ouvert à ce que ça change
```

### Prompt 12

```text
tu peux me détailelr step by step ce que je dois faire
```

### Prompt 13

```text
Tu peux me donner les 10 ETF à choisir qui font sens et que tu m'explique en détail comment accéder au factsheet
```

### Prompt 14

```text
un peu trop de iShares à mon gout
```

### Prompt 15

```text
je trouve pas la facsheet tu peux me refaire tout le tableau en changeant le 10 merci
```

### Prompt 16

```text
fais le tableau in english pls
```

### Prompt 17

```text
Pièces jointes : les 10 factsheets PDF
Tu peux faire le tableau avec le lien des pdf merci
```

### Prompt 18

```text
stp tu peix pas créer des liens qui menent direct aux fichiers pdf que je t'ai send
```

### Prompt 19

```text
fait un truc copiable dans le chat
```

### Prompt 20

```text
bah la ca mene pas au pdf
```

### Prompt 21

```text
mais tu peux check que tes liens correspondent à ceux des pdf que je t'ai envoyé ?
```

### Prompt 22

```text
Refais moi le tableau avec juste les liens des pages sites
```

### Prompt 23

```text
Bon c'est bon j'ai le fichier avec les liens qui menent au pdf, c'est quoi la next step deja ?
```

### Prompt 24

```text
Fais le 1.

Pour le 2. On va faire un étudiant working student qui veut placer quelques milliers d'euros, un jeune actif cadre qui gagne disons 3-4k€ par mois, et un utilisateur type moins dans la cible de 45 ans

Donc fais le 1 et le 2 mtn
```

### Prompt 25

```text
en anglais et je pense que tu peux etre un peu plus précis non ?
```

### Prompt 26

```text
ça tu peux me le faire non ? Sur la base de la présentation
```

### Prompt 27

```text
Tu peux le faire en mode extra pour bien aller chercher les papiers de recherche etc sur la description de l'app
```

### Prompt 28

```text
Fais moi un zip avec App description en pdf, les 10 factsheets et toi les extraits de facsheets que t'avais fait
```

### Prompt 29

```text
Pièce jointe : export Notion (ExportBlock .zip)
et met ça dans le read me
```

### Prompt 30

```text
Le zip j'aimerai le faire en format

1. 2. 3. Comme il l'avait fait pour que ça soit claire pour lui (1. c'est son 1. etc)
```

### Prompt 31

```text
Ok super, et mtn il reste plus qu'à ce qu'on liste les prompts ensemble, je veux que tu les mettes en anglais 
```

### Prompt 32

```text
nannan fait un 4. nommé AI prompt dans le texte sous format word I guess et met y notre derniere version du prompt
```

### Prompt 33

```text
En fait le AI prompts donne pas de num

Et les notion ça m'arrangerait vrmt que tu les passes en word
```

### Prompt 34

```text
Mais je veux que tu suppr tous les readme et que tout le content soit en word bro
```

### Prompt 35

```text
juste suppr le data files description et le AI prompts ça doit plus être en 4. (c'est pas numéroté), aussi met pas de v dans le nom du fichier
```

### Prompt 36

```text
mtn mais un msg whatsapp ou j'explique à Joachim que tout ce qu'il m'a demandé est dans le zip
 
```

## English summary (written by Damien with AI assistance, not verbatim)

Source: `team/damien/Headroom_package/AI_prompts/AI_prompts.docx` (converted to Markdown; wording unchanged).

### Pitch deck and script

- Help me with a group assignment ("Building Your Own Wealth", team of three). First I need a short pitch deck: max 10 minutes, 7–8 slides, covering the pain, the solution and the product, with no screenshots. Base the structure on the First Mile template. (Attached: module outline, assignment brief, validated idea.)
- Give the project a name in the slides. Then write a script for two speakers (me and Jens), about 8 minutes in total.
- In the script only, replace the old name with Headroom. Don't touch the human capital wording.

### App development brief

- We now have to build the app, and the developer sent us this message with tasks 1 to 5. Explain what I have to do. (Attached: the developer's message.)
- For task 1, tell the developer we can base the design on Finary. Give him the main lines of our idea and keep the bullets short. Mention that we called it Headroom in the pitch but I'm open to changing the name.

### Demo data

- Use the default format (CSV), whatever will help the developer most. Then choose the 10 ETFs.
- Give me 10 ETFs that make sense, and explain in detail how to access each factsheet. Too many are iShares, so change some.
- Redo the whole table in English, with links to the PDF factsheets I sent you.
- Extract the data from the 10 PDFs into the CSV files the developer needs (ETFs, top holdings, regions, sectors).
- Create the 3 example users. A working student with a few thousand euros. A young professional earning about €3–4k a month. A 45-year-old, less in our target. Write it in English and be more precise.

### Application description

- Write the application description (2–3 pages: problem, solution, key features, target users, research with Ayres & Nalebuff and Ibbotson et al.), based on the presentation.
- Do it in extended mode, so you properly search for and verify the research papers.

### Packaging

- Make a zip with the description as a PDF, the 10 factsheets and your extracts. Add my Notion notes to the README, and structure the folders with the same numbering as the developer's task list.

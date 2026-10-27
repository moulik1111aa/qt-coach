// Unit 1 · Quantitative Techniques: an introduction (book pp. 1–7 of the unit). Theory only.

import { mcq } from '../kit.ts';
import type { Chapter, ShortAnswer, Topic } from '../types.ts';

const short = (id: string, topic: string, prompt: string, points: string[], model: string, marks = 5): ShortAnswer => ({ id, topic, prompt, points, model, marks });

// ---------------------------------------------------------------------------------------------

const M = 'qt-meaning';
const meaning: Topic = {
  id: M,
  chapter: 1,
  title: 'What QT is and why it matters',
  blurb: 'Meaning of quantitative techniques and the reasons managers use them',
  kind: 'theory',
  pages: [1, 2],
  cards: [
    {
      id: 'why',
      title: 'What QT means, in one line',
      body: [
        { p: '**Quantitative techniques (QT)** means **using numbers to make better business decisions**. That is all the name means.' },
        { p: 'You already do this in daily life: comparing prices per kg, working out EMI on a loan, checking which phone plan is cheaper.' },
        { p: 'A manager does the same on a bigger scale:' },
        { list: ['A shop decides how much stock to order from **past sales figures**.', 'A bank decides who gets a loan from **credit scores**.', 'A factory decides how many of each product to make so that **no machine stands idle** (you will solve one in Unit 3).'] },
        { tip: 'This unit has no calculations. It is theory, asked in the exam as MCQs and short written answers.' },
      ],
    },
    {
      id: 'need',
      title: 'Information is rarely ready-made',
      page: 1,
      body: [
        { p: 'Good decisions need facts, but the real world rarely hands us facts ready to use. We have to **collect data and work on it** with calculations and techniques before we can conclude anything. Without data, it is hard to get real results.' },
        { p: 'The book gives two examples:' },
        { list: ['**A television show**: to know how many people actually watch it, the makers must run a large survey, which costs both money and time.', '**A consumer protection agency**: to know what is really in the medicines sold in the market, and in what proportions, it needs information that nobody has ready.'] },
        { def: 'Quantitative techniques (QT)', text: 'Methods that use numbers (mathematical, statistical and programming tools) to analyse data and support decisions.' },
      ],
    },
    {
      id: 'where',
      title: 'Where QT is used',
      page: 1,
      body: [
        { p: 'The book lists four management areas where QT helps managers decide well:' },
        { def: 'Marketing', text: 'Forecasting how much will sell next festive season.' },
        { def: 'Human Resource Management', text: 'Working out how many staff are needed, and fair pay scales.' },
        { def: 'Production & Operations Management', text: 'Scheduling machines and controlling quality.' },
        { def: 'Financial Management', text: 'Choosing between investments and preparing budgets.' },
        { p: 'Today QT is also used in **military, communication and advanced defence planning**.' },
      ],
    },
    {
      id: 'reasons',
      title: 'Why QT is used so widely: three reasons',
      page: 2,
      body: [
        { p: 'The book gives three reasons. In plain words:' },
        { def: '1. Variety of tools', text: 'There is a ready tool for almost every kind of problem, even complicated ("intricate") managerial ones.' },
        { def: '2. Technology', text: 'Fast computers and better methods ("algorithms") can run these models quickly and apply them to real-life problems.' },
        { def: '3. Complex business', text: 'Business today is complicated at every stage of a decision: understanding the situation, setting objectives, finding alternatives, carrying the decision out, coordinating people, and checking results. Numbers help at each stage.' },
        { tip: 'Memory hook: **Tools, Technology, Tough business.**' },
      ],
    },
    {
      id: 'qual',
      title: 'Numbers do not replace judgement',
      page: 2,
      body: [
        { p: 'QT matters, but it **does not remove the qualitative approach**: the experience and judgement of the person deciding.' },
        { eg: 'A sales forecast (numbers) says a manager can expect 5,000 units. She knows a competitor is launching a cheaper product next month (judgement). She trusts the forecast less and orders cautiously.' },
        { p: 'The book\'s conclusion: the best answer to a complex business situation is a **combined approach** of quantitative and qualitative techniques.' },
      ],
    },
    {
      id: 'exam',
      title: 'Writing it in the exam',
      body: [
        { p: 'A typical question: "What are quantitative techniques? Why are they important for managers?" A good answer has four parts:' },
        { list: ['**Define** QT in one line (methods that use numbers to analyse data and support decisions).', '**Why needed:** information is rarely ready-made; give the TV-survey example.', '**Three reasons** it is widely used: variety of tools, technology, complex business.', '**Conclude:** numbers do not replace judgement; the best approach combines both.'], ordered: true },
        { tip: 'Name the four areas (marketing, HR, production, finance) with one example each if the question asks "where".' },
      ],
    },
  ],
  examples: [],
  paper: [],
  gens: [],
  short: [
    short(`${M}:s1`, M, 'What are quantitative techniques? Explain with an example why managers need them.', ['Methods using numbers (maths, statistics, programming) to analyse data', 'Real-world information is not readily available', 'An example, e.g. the TV-show viewership survey or the drug-agency study', 'They support effective decisions'], 'Quantitative techniques are methods that use mathematical, statistical and programming tools to analyse numerical data and support decisions. In the real world information is rarely available ready-made; it has to be collected and analysed. For example, makers of a television show who want to know how many people watch it must conduct an extensive survey, which needs money and time, and then analyse the results. QT gives managers a structured way to turn such data into effective decisions.'),
    short(`${M}:s2`, M, 'Give three reasons why quantitative techniques are widely used in decision making.', ['A variety of quantitative tools for intricate managerial problems', 'Latest technology: fast computers and algorithms to simulate models', 'Complexity of today\'s business dynamics', 'Each reason briefly explained'], '1. Variety of tools: many quantitative tools are available to analyse intricate managerial difficulties.\n2. Technology: high-speed computers and superior algorithms make it possible to simulate quantitative representations and map them to real-life problems.\n3. Complex business dynamics: modern business poses severe challenges in situation analysis, objective setting, seeking alternatives, implementation, coordination and evaluation of decisions.'),
    short(`${M}:s3`, M, '"Quantitative techniques do not eliminate the need for judgement." Discuss.', ['QT is important for decisions', 'It does not remove the qualitative approach or judgement', 'Best solution is a combined approach', 'An example of qualitative factors'], 'Quantitative techniques give managers objective, numerical analysis, and their importance is clear. But they do not eliminate the qualitative approach or the judgement ability of the decision maker. Factors such as morale, a competitor\'s intentions or brand image are hard to quantify. The book concludes that the perfect solution to any complex business situation is a combined approach of quantitative and qualitative techniques.'),
    short(`${M}:s4`, M, 'Name the management areas and other fields where quantitative techniques are applied.', ['Marketing', 'Human Resource Management', 'Production & Operations and Financial Management', 'Military, communication and defence planning'], 'QT helps managers in Marketing, Human Resource Management, Production & Operations Management and Financial Management. Today the techniques are also used in military, communication and advanced defence planning.'),
  ],
  mcqs: [
    mcq(`${M}:c1`, M, 'basic', 'Quantitative techniques are mainly used to…', 'analyse numerical data to support decisions', ['replace managers', 'write company policies', 'design advertisements'], 'They turn data into decisions.'),
    mcq(`${M}:c2`, M, 'basic', 'Why does the book mention a television show?', 'Finding its viewership needs an extensive, costly survey', ['TV shows use matrices', 'TV ratings are always available', 'It is an example of qualitative analysis'], 'Information is not readily available; it must be collected at a cost of money and time.'),
    mcq(`${M}:c3`, M, 'basic', 'A consumer protection agency studying drugs on the market illustrates that…', 'required information is not readily available', ['drugs are priced by formula', 'QT is used only in medicine', 'surveys are unnecessary'], 'The agency must gather data itself.'),
    mcq(`${M}:c4`, M, 'basic', 'Which is NOT one of the book\'s reasons for using QT?', 'QT removes the need for managerial judgement', ['A variety of quantitative tools is available', 'Fast computers and algorithms are accessible', 'Business dynamics are complex'], 'The book says QT does not eliminate judgement.'),
    mcq(`${M}:c5`, M, 'exam', 'According to the book, the perfect solution to a complex business situation uses…', 'a combined quantitative and qualitative approach', ['only quantitative techniques', 'only managerial judgement', 'only computer simulation'], 'Combined approach.'),
    mcq(`${M}:c6`, M, 'basic', 'QT helps managers in which domains?', 'Marketing, HRM, Production & Operations, Finance', ['Only Finance', 'Only Production', 'Only government'], 'All four functional areas.'),
    mcq(`${M}:c7`, M, 'exam', 'Outside business, the book says QT is used in…', 'military, communication and advanced defence planning', ['religion and philosophy', 'fashion design only', 'agriculture only'], 'Book, introduction.'),
    mcq(`${M}:c8`, M, 'exam', 'High-speed computers help QT because they can…', 'simulate quantitative models and map them to real problems', ['make decisions without data', 'remove uncertainty completely', 'replace qualitative factors'], 'Reason 2.'),
    mcq(`${M}:c9`, M, 'exam', 'Which managerial activity does the book list among the challenges of complex business dynamics?', 'Seeking alternatives', ['Printing invoices', 'Hiring auditors', 'Paying taxes'], 'Situation analysis, objective setting, seeking alternatives, implementation, coordination and evaluation.'),
    mcq(`${M}:c10`, M, 'basic', 'Which of these is a qualitative factor?', 'Employee morale', ['Monthly sales in units', 'Cost per unit', 'Market share in %'], 'It is hard to measure in numbers.'),
    mcq(`${M}:c11`, M, 'exam', 'If data is not available, the book says it will be…', 'hard to get the actual results', ['easy to guess the results', 'unnecessary to decide', 'replaced by a formula'], 'Data is the input to every technique.'),
    mcq(`${M}:c12`, M, 'tough', 'A manager uses a forecast but adjusts it because a rival is about to launch a product. This shows…', 'combining quantitative output with qualitative judgement', ['rejecting QT entirely', 'pure quantitative decision making', 'a failure of QT'], 'The book\'s recommended combined approach.'),
    mcq(`${M}:c13`, M, 'exam', 'Which statement best describes the role of QT?', 'A support for decisions, not a replacement for the decision maker', ['A replacement for the decision maker', 'Useful only for accountants', 'A substitute for collecting data'], 'Book: QT does not eliminate judgement.'),
    mcq(`${M}:c14`, M, 'basic', 'Running a survey to find a TV audience mainly costs…', 'money and time', ['nothing, data is free', 'only computer power', 'only qualitative judgement'], 'Book example.'),
    mcq(`${M}:c15`, M, 'tough', 'Which pair matches a reason for QT with its description?', 'Technology: simulating models with fast computers', ['Technology: removing qualitative factors', 'Variety of tools: only one tool for every problem', 'Business dynamics: problems have become simpler'], 'Reason 2 is about computers and algorithms.'),
  ],
};

// ---------------------------------------------------------------------------------------------

const C = 'qt-class';
const classify: Topic = {
  id: C,
  chapter: 1,
  title: 'Classification of quantitative techniques',
  blurb: 'Mathematical, statistical and programming techniques',
  kind: 'theory',
  pages: [2, 3, 4, 5],
  cards: [
    {
      id: 'why',
      title: 'Why sort the techniques into families?',
      body: [
        { p: 'There are dozens of techniques. Sorting them into **three families** helps you remember them and pick the right one for a problem. "Classify quantitative techniques" is also a common exam question.' },
        { p: 'You have already met some: **matrices and determinants** (Units 2 and 3) belong to the mathematical family.' },
      ],
    },
    {
      id: 'three',
      title: 'Three families of techniques',
      page: 2,
      body: [
        { p: 'For convenience, the book divides QT into techniques based on:' },
        { def: '1. Mathematical calculations', text: 'Work with exact relationships and formulas. Example: solving equations to find prices.' },
        { def: '2. Statistical calculations', text: 'Learn from collected data and how it varies. Example: average monthly sales and how much they swing.' },
        { def: '3. Programming', text: 'Build a model, usually run on a computer, that finds the **best** decision. Example: the product mix that gives the most profit.' },
        { tip: 'Memory hook: maths = **exact**, statistics = **data**, programming = **best choice**.' },
      ],
    },
    {
      id: 'maths',
      title: 'The mathematical family',
      page: 2,
      body: [
        { p: 'Each technique in plain words, with a business example:' },
        { def: 'Permutations and combinations', text: 'Ways of counting. A **permutation** is an arrangement where **order matters** (arranging 3 products on a shelf). A **combination** is a selection where **order does not matter** (choosing 3 people for a committee).' },
        { def: 'Set theory', text: 'Deals with collections (groups) of objects. Example: customers who bought product A, those who bought B, and those who bought both.' },
        { def: 'Matrix algebra', text: 'Works with numbers arranged in rows and columns, such as sales tables (Unit 2).' },
        { def: 'Determinants', text: 'A single value worked out from a square matrix, used to solve equations (Unit 3).' },
        { def: 'Differentiation', text: 'Finds how much one quantity changes when another changes a little. Example: the extra profit from selling one more unit.' },
        { def: 'Integration', text: 'The reverse of differentiation: builds a total from small changes. Example: total cost from the cost of each extra unit.' },
        { def: 'Differential equation', text: 'An equation that includes rates of change (derivatives). Example: describing how sales grow over time.' },
      ],
    },
    {
      id: 'stats1',
      title: 'The statistical family (1): describing data',
      page: 3,
      body: [
        { def: 'Collection of data', text: 'The first step of any statistical work. **Primary** data you collect yourself (a customer survey); **secondary** data someone else has already collected (government reports).' },
        { def: 'Central tendency', text: 'One typical value for a whole set of data, like the average salary in a firm. Five measures: arithmetic mean, median, mode, geometric mean and harmonic mean.' },
        { def: 'Dispersion', text: 'How **spread out** the data is. Two shops can both average ₹50,000 sales a month, one steady and one swinging wildly. Measures: range, mean deviation, standard deviation and variance, quartile deviation. Spiegel\'s definition: "the degree to which numerical data tend to spread about an average value".' },
        { def: 'Skewness', text: 'How **lopsided** the data is (lack of symmetry). Incomes are a classic case: most earn modest amounts, a few earn a lot. It can be positive, negative or zero.' },
        { def: 'Kurtosis', text: 'How **peaked or flat** the shape of the data is.' },
      ],
    },
    {
      id: 'stats2',
      title: 'The statistical family (2): relationships and decisions',
      page: 4,
      body: [
        { def: 'Correlation and regression', text: '**Correlation** measures how closely two things move together (advertising and sales). **Regression** uses one to estimate the other (sales expected from a given ad budget).' },
        { def: 'Index numbers', text: '"Economic barometers": they measure changes in prices, production and so on over time. The consumer price index is one.' },
        { def: 'Time series analysis', text: 'Studies how something changes over time, and why (for example monthly sales with a festive-season peak).' },
        { def: 'Interpolation and extrapolation', text: 'Estimating a missing figure **inside** the range of known figures (interpolation), or **beyond** it, like next year\'s sales (extrapolation).' },
        { def: 'Statistical quality control', text: 'Measures and controls the quality of goods and services, using charts.' },
        { def: 'Ratio analysis', text: 'Studies financial statements by comparing figures as ratios, for example current assets to current liabilities.' },
        { def: 'Probability theory', text: 'Puts a number on the chance of something happening, such as a customer not repaying a loan.' },
        { def: 'Testing of hypothesis', text: 'Uses a sample to decide between two statements, such as "the new advert raised sales" and "it made no difference".' },
        { bookNote: 'The printed description of correlation and regression repeats the text for "collection of data". The meanings above are the standard ones.' },
      ],
    },
    {
      id: 'prog',
      title: 'The programming family: finding the best decision',
      page: 4,
      body: [
        { p: 'These build a model, usually run on a computer, to help a decision maker:' },
        { def: 'Linear programming', text: 'Finds the best result (most profit, least cost) when the relationships are straight-line (linear) ones. Example: the best mix of products with limited machine hours.' },
        { def: 'Queuing theory', text: 'Studies waiting lines: waiting times and service times. Example: how many bank counters to open.' },
        { def: 'Game theory', text: 'Two or more players, each seeking the best outcome under fixed rules. Example: rival firms setting prices.' },
        { def: 'Decision theory', text: 'Choosing the best option under different levels of risk. Example: launch now or wait?' },
        { def: 'Inventory theory', text: 'Designs a stock (inventory) system with the lowest total cost: how much to order and when.' },
        { def: 'Network programming', text: 'Plans, monitors and coordinates large projects with many activities, such as building a factory (allocating resources, adjusting times).' },
        { def: 'Simulation', text: 'Tries out a model that imitates a real situation, before risking the real thing.' },
        { def: 'Non-linear programming', text: 'Finds the best result when the relationships are not straight lines.' },
      ],
    },
    {
      id: 'exam',
      title: 'Writing it in the exam',
      body: [
        { p: 'For "Classify quantitative techniques" (or "Explain the types of QT"):' },
        { list: ['Say QT is divided, for convenience, into **three** families.', 'Under each heading, name **4 to 6 techniques** with one line each.', 'Add a business example for two or three of them.', 'Close with one line: the right family depends on the problem (exact relationship, data, or best choice).'], ordered: true },
      ],
    },
  ],
  examples: [],
  paper: [],
  gens: [],
  short: [
    short(`${C}:s1`, C, 'Classify quantitative techniques, giving two examples of each class.', ['Three classes: mathematical, statistical, programming', 'Two mathematical examples (e.g. matrices, determinants)', 'Two statistical examples (e.g. central tendency, index numbers)', 'Two programming examples (e.g. LP, queuing)'], 'Quantitative techniques fall into three classes.\n1. Based on mathematical calculations: e.g. matrix algebra and determinants (also permutations and combinations, set theory, differentiation, integration, differential equations).\n2. Based on statistical calculations: e.g. measures of central tendency and index numbers (also dispersion, correlation and regression, time series, probability, testing of hypothesis).\n3. Based on programming: e.g. linear programming and queuing theory (also game theory, decision theory, inventory, network programming, simulation).', 6),
    short(`${C}:s2`, C, 'Distinguish between permutations and combinations.', ['Permutation: arrangement in an order', 'Combination: selection without regard to order', 'Order matters only for permutations', 'An example'], 'A permutation is an arrangement of selected items in a definite order, so ABC and BAC are different permutations. A combination is a selection of items without regard to order, so ABC and BAC are the same combination. The number of permutations is larger because each selection can be ordered in several ways.'),
    short(`${C}:s3`, C, 'What are measures of dispersion? Name them.', ['Dispersion means scatteredness', 'Spiegel\'s definition: spread about an average', 'Mean deviation, range', 'Standard deviation and variance, quartile deviation'], 'Dispersion literally means "scatteredness". Spiegel defines it as the degree to which numerical data tend to spread about an average value. It is measured by the mean deviation, the range, the standard deviation and variance, and the quartile deviation.'),
    short(`${C}:s4`, C, 'Write short notes on any three programming-based techniques.', ['Correct definition of a first technique', 'Correct definition of a second technique', 'Correct definition of a third technique', 'Link to decision making'], 'Linear programming finds the best outcome (for example maximum profit) from a model expressed in linear equations. Queuing theory studies waiting lines, giving the waiting and service time of a queue. Inventory theory designs the production or inventory system that minimises the cost for the business. All are model-building techniques run with computer algorithms to support decisions.'),
    short(`${C}:s5`, C, 'Differentiate between interpolation and extrapolation, and between skewness and kurtosis.', ['Interpolation: estimate within the range', 'Extrapolation: estimate outside the range', 'Skewness: lack of symmetry', 'Kurtosis: peakedness or flatness'], 'Interpolation estimates missing figures that fall within the range of the given data; extrapolation estimates figures that fall outside it. Skewness measures the lack of symmetry of a distribution (positive, negative or zero), while kurtosis measures its peakedness or flatness.'),
  ],
  mcqs: [
    mcq(`${C}:c1`, C, 'basic', 'The book classifies QT into techniques based on…', 'mathematical, statistical and programming calculations', ['marketing, finance and HR', 'primary and secondary data', 'manual and computer methods'], 'Three classes.'),
    mcq(`${C}:c2`, C, 'basic', 'Which is a mathematical technique?', 'Determinants', ['Index numbers', 'Queuing theory', 'Testing of hypothesis'], 'Determinants are in the mathematical group.'),
    mcq(`${C}:c3`, C, 'basic', 'Which is a statistical technique?', 'Time series analysis', ['Matrix algebra', 'Linear programming', 'Game theory'], 'Statistical group.'),
    mcq(`${C}:c4`, C, 'basic', 'Which is a programming technique?', 'Queuing theory', ['Set theory', 'Ratio analysis', 'Kurtosis'], 'Programming (model-building) group.'),
    mcq(`${C}:c5`, C, 'exam', 'A permutation differs from a combination because…', 'order matters in a permutation', ['order matters in a combination', 'a permutation never repeats items', 'they are the same'], 'Book: combination selects without considering order.'),
    mcq(`${C}:c6`, C, 'exam', 'Integration is described in the book as…', 'the converse procedure of differentiation', ['a type of matrix', 'a measure of dispersion', 'a queuing model'], 'Book definition.'),
    mcq(`${C}:c7`, C, 'basic', 'How many methods of central tendency does the book list?', 'Five', ['Three', 'Four', 'Seven'], 'AM, mode, GM, HM and median.'),
    mcq(`${C}:c8`, C, 'exam', 'Spiegel defines dispersion as…', 'the degree to which numerical data tend to spread about an average value', ['the peakedness of a curve', 'lack of symmetry', 'the average of the data'], 'Book quotes Spiegel.'),
    mcq(`${C}:c9`, C, 'exam', 'Kurtosis measures…', 'peakedness or flatness of a curve', ['lack of symmetry', 'the average value', 'correlation between two variables'], 'Skewness is about symmetry.'),
    mcq(`${C}:c10`, C, 'exam', 'Index numbers are described as…', 'economic barometers', ['measures of skewness', 'programming models', 'types of matrices'], 'They measure fluctuations in price, production and so on.'),
    mcq(`${C}:c11`, C, 'exam', 'Estimating a value that falls outside the range of given data is…', 'extrapolation', ['interpolation', 'regression', 'simulation'], 'Interpolation stays within the range.'),
    mcq(`${C}:c12`, C, 'basic', 'Statistical quality control uses…', 'charts to measure and control quality', ['matrices to allocate stock', 'game theory', 'set theory'], 'Book: various charts are employed.'),
    mcq(`${C}:c13`, C, 'exam', 'Which technique designs the stock system that minimises cost?', 'Inventory theory', ['Decision theory', 'Network programming', 'Probability theory'], 'Book definition.'),
    mcq(`${C}:c14`, C, 'exam', 'Which measure is NOT a measure of dispersion?', 'Median', ['Range', 'Standard deviation', 'Quartile deviation'], 'The median is a measure of central tendency.'),
    mcq(`${C}:c15`, C, 'tough', 'Planning, monitoring and harmonising a large project with many activities uses…', 'network programming', ['ratio analysis', 'interpolation', 'set theory'], 'Book: network programming helps allocate resources and adjust times.'),
    mcq(`${C}:c16`, C, 'tough', 'Skewness can be…', 'positive, negative or zero', ['only positive', 'only zero', 'peaked or flat'], 'Peaked or flat is kurtosis.'),
    mcq(`${C}:c17`, C, 'exam', 'Testing of hypothesis…', 'evaluates two statements to see which the sample supports', ['finds the best product mix', 'measures peakedness', 'arranges items in order'], 'Book definition.'),
  ],
};

// ---------------------------------------------------------------------------------------------

const R = 'qt-role';
const role: Topic = {
  id: R,
  chapter: 1,
  title: 'Role of QT in business and industry',
  blurb: 'The product A or B decision, and QT in each management area',
  kind: 'theory',
  pages: [5, 6, 7],
  cards: [
    {
      id: 'why',
      title: 'Every department uses numbers',
      body: [
        { p: 'This topic answers one question: **how does QT help a business in practice?** The book uses one decision as a case, then goes department by department.' },
        { p: '"Discuss the role of QT in business and industry" is a likely written question, so the last card shows how to answer it.' },
      ],
    },
    {
      id: 'case',
      title: 'A decision: launch B or revive A?',
      page: 5,
      body: [
        { p: 'A company\'s product A has reached **saturation**: its sales have stopped growing because most people who want it already have it. Should the company launch a new product B now, or spend the money reviving A, which customers already know?' },
        { p: 'The book shows four ways QT helps:' },
        { def: '1. Cost-benefit analysis', text: 'Compare the total cost of each option with what it brings in, using mathematical and statistical models, then decide.' },
        { def: '2. Gathering market data', text: 'Measure customers\' interest in B with sample surveys and hypothesis testing.' },
        { def: '3. Applying statistical models', text: 'Models such as factor analysis and cluster sampling compare how far the old product reaches with how far the new one could.' },
        { def: '4. Building financial models', text: 'Linear programming models find the lowest cost and the highest profit.' },
      ],
    },
    {
      id: 'areas1',
      title: 'QT in marketing and production',
      page: 6,
      body: [
        { p: 'QT is not limited to one department; it is part of decision making across the whole organisation.' },
        { def: 'Marketing', text: 'Market research; keeping statistical records for a large market; planning and forecasting sales.' },
        { def: 'Production', text: 'Planning and controlling production; judging how well a machine performs; quality-control requirements; controlling inventory (stock).' },
      ],
    },
    {
      id: 'areas2',
      title: 'QT in finance and personnel',
      page: 6,
      body: [
        { def: 'Accounting, investment and finance', text: 'Preparing budgets and forecasting financial results; investment decisions; choosing securities (shares, bonds); audits; credit policy, overdue ("delinquent") accounts and credit risk.' },
        { def: 'Personnel (HR)', text: 'Labour turnover rate (how fast staff leave); employment trends; performance appraisal; wage rates and incentive plans.' },
        { p: '**The book\'s summary:** QT is used widely because decisions are complicated and important. Better computers encourage more advanced analysis. Yet the judgement of the decision maker still has its place.' },
      ],
    },
    {
      id: 'exam',
      title: 'Writing it in the exam',
      body: [
        { p: 'For "Discuss the role of QT in business and industry":' },
        { list: ['**Open** with one line: QT supports decisions across the whole organisation.', '**Case:** product A at saturation, launch B or revive A, and the four ways QT helps.', '**Areas:** marketing, production, finance, personnel, with two uses each.', '**Conclude:** decisions are complex, computers make analysis easier, and judgement still matters.'], ordered: true },
      ],
    },
  ],
  examples: [],
  paper: [],
  gens: [],
  short: [
    short(`${R}:s1`, R, 'A company must choose between launching a new product B and reviving its existing product A. How can quantitative techniques help?', ['Cost-benefit analysis of A and B', 'Gathering market data: surveys, hypothesis testing', 'Statistical models: factor analysis, cluster sampling', 'Financial models: linear programming for cost and profit'], 'Product A is close to saturation, so the company must decide between launching B and reviving A. QT helps in four ways. Cost-benefit analysis compares the total cost of each option using mathematical and statistical models. Market data, gathered through sample surveys and analysed by hypothesis testing, gauges customers\' interest in B. Statistical models such as factor analysis and cluster sampling compare the reach of the old product with the new. Financial models built with linear programming find the optimum cost and the maximum profit.', 8),
    short(`${R}:s2`, R, 'Explain the use of quantitative techniques in marketing and production.', ['Marketing: market research analysis', 'Marketing: sales planning and projections (and records)', 'Production: planning/controlling production, machine performance', 'Production: quality control and inventory control'], 'In marketing, QT is used for market research analysis, for statistical records needed to keep up a vast market, and for sales planning and projections. In production it is used to plan and control production, to evaluate the performance of machines, to set requirements for quality control and to decide measures for inventory control.'),
    short(`${R}:s3`, R, 'How are quantitative techniques used in accounting and finance?', ['Budgets and forecasting financial performance', 'Investment decisions and selection of securities', 'Carrying out audits', 'Credit policy, delinquent accounts and credit risk'], 'In accounting, investment and finance, QT is used to prepare budgets and forecast financial performance, to take financial investment decisions and select securities, to carry out audits (for example by sampling), and to set credit policies and manage delinquent accounts and credit risk.'),
    short(`${R}:s4`, R, 'State the uses of quantitative techniques in personnel management.', ['Labour turnover rate', 'Employment trends', 'Performance appraisal', 'Wage rates and incentive plans'], 'In personnel management QT is used to measure the labour turnover rate, to study trends in employment, in performance appraisal, and to fix wage rates and design incentive plans.'),
  ],
  mcqs: [
    mcq(`${R}:c1`, R, 'basic', 'In the book\'s example, product A is…', 'close to its saturation stage', ['not yet launched', 'a failure', 'in its introduction stage'], 'So the question is whether to launch B or revive A.'),
    mcq(`${R}:c2`, R, 'basic', 'Comparing the total cost needed for products A and B is…', 'cost-benefit analysis', ['ratio analysis', 'queuing', 'interpolation'], 'Book.'),
    mcq(`${R}:c3`, R, 'exam', 'To gauge customers\' interest in a new product, the book suggests…', 'sample surveys and hypothesis testing', ['determinants', 'set theory', 'differential equations'], 'Gathering market data.'),
    mcq(`${R}:c4`, R, 'exam', 'Factor analysis and cluster sampling are used to…', 'understand the reach of the old product against the new one', ['set wage rates', 'compute determinants', 'plan audits only'], 'Applying statistical models.'),
    mcq(`${R}:c5`, R, 'exam', 'Financial models that find the optimum cost and maximum profit use…', 'linear programming', ['kurtosis', 'index numbers', 'set theory'], 'Constructing financial models.'),
    mcq(`${R}:c6`, R, 'basic', 'Sales planning and projections belong to which area?', 'Marketing', ['Personnel', 'Production', 'Audit'], 'Book list for Marketing.'),
    mcq(`${R}:c7`, R, 'basic', 'Performance evaluation of a machine belongs to…', 'Production', ['Marketing', 'Personnel', 'Finance'], 'Book list for Production.'),
    mcq(`${R}:c8`, R, 'basic', 'Labour turnover rate is studied in…', 'Personnel', ['Marketing', 'Production', 'Investment'], 'Book list for Personnel.'),
    mcq(`${R}:c9`, R, 'exam', 'Selection of securities is a use of QT in…', 'accounting, investment and finance', ['personnel', 'production', 'marketing'], 'Book list.'),
    mcq(`${R}:c10`, R, 'exam', 'Credit policies and delinquent accounts are analysed in…', 'accounting, investment and finance', ['production', 'personnel', 'marketing'], 'Book list.'),
    mcq(`${R}:c11`, R, 'exam', 'Measures for inventory control belong to…', 'Production', ['Personnel', 'Marketing', 'Audit'], 'Book list for Production.'),
    mcq(`${R}:c12`, R, 'basic', 'Wage rates and incentive plans belong to…', 'Personnel', ['Production', 'Finance', 'Marketing'], 'Book list for Personnel.'),
    mcq(`${R}:c13`, R, 'exam', 'The book says QT is…', 'not limited to one department', ['used only by the finance department', 'used only in factories', 'too costly for most decisions'], 'It is part of decision making across the organisation.'),
    mcq(`${R}:c14`, R, 'tough', 'A bank sets interest rates for loans after scoring applicants\' risk. Which area\'s QT use is this?', 'Credit risk in accounting and finance', ['Performance appraisal', 'Quality control', 'Market research'], 'Credit policies and credit risk.'),
    mcq(`${R}:c15`, R, 'tough', 'Using sample checks of vouchers to judge whether accounts are correct is…', 'carrying out an audit with QT', ['sales projection', 'labour turnover analysis', 'game theory'], 'Audit is in the finance list.'),
    mcq(`${R}:c16`, R, 'exam', 'According to the summary, what encourages more sophisticated data analysis?', 'Progress in computer technology', ['Lower data availability', 'Simpler decisions', 'Fewer managers'], 'Book summary.'),
  ],
};

export const ch01: Chapter = {
  n: 1,
  unit: 1,
  title: 'Introduction to QT',
  blurb: 'What quantitative techniques are, their types, and their role in business',
  topics: [meaning, classify, role],
  formulas: [],
};

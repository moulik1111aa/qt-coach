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
      id: 'need',
      title: 'Information is rarely ready-made',
      page: 1,
      body: [
        { p: 'The real world does not hand us information that is ready to use. We need calculations, **quantitative techniques** and other tools to reach a conclusion, and without data it is hard to get actual results.' },
        { p: 'The book gives two examples:' },
        { list: ['**A television show**: to know how many people watch it, the makers must run an extensive survey, which costs both money and time.', '**A consumer protection agency**: to know the actual proportions and characteristics of drugs on the market, it needs information that is not readily available.'] },
        { def: 'Quantitative techniques (QT)', text: 'Methods that use numbers (mathematical, statistical and programming tools) to analyse data and support decisions.' },
      ],
    },
    {
      id: 'where',
      title: 'Where QT is used',
      page: 1,
      body: [
        { p: 'QT helps managers make effective decisions in:' },
        { list: ['Marketing', 'Human Resource Management', 'Production & Operations Management', 'Financial Management'] },
        { p: 'Today they are also used in **military, communication and advanced defence planning**.' },
      ],
    },
    {
      id: 'why',
      title: 'Why QT is used so widely in decision making',
      page: 2,
      body: [
        { p: 'The book gives three reasons:' },
        { list: ['**Variety of tools**: a wide range of quantitative tools is available to analyse intricate managerial problems.', '**Technology**: high-speed computers and superior algorithms can simulate quantitative models and map them to real-life problems.', '**Complex business dynamics**: today\'s business poses severe challenges in situation analysis, objective setting, seeking alternatives, implementation, coordination and evaluation of decisions.'], ordered: true },
      ],
    },
    {
      id: 'qual',
      title: 'Numbers do not replace judgement',
      page: 2,
      body: [
        { p: 'These reasons show why QT matters, but they **do not eliminate the qualitative approach** or the judgement of the decision maker.' },
        { p: 'The book\'s conclusion: the best solution to any complex business situation is a **combined approach** of quantitative and qualitative techniques.' },
        { eg: 'A sales forecast (quantitative) tells a manager how many units to expect; knowledge of a competitor\'s planned launch (qualitative) tells her whether to trust it.' },
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
      id: 'three',
      title: 'Three families of techniques',
      page: 2,
      body: [
        { p: 'For convenience, QT is divided into techniques based on:' },
        { list: ['**mathematical** calculations', '**statistical** calculations', '**programming** (model building)'], ordered: true },
        { tip: 'A useful memory hook: maths works with exact relationships, statistics with data and variation, programming with models that find the best decision.' },
      ],
    },
    {
      id: 'maths',
      title: 'Techniques based on mathematical calculations',
      page: 2,
      body: [
        { p: 'These use mathematical principles to analyse quantitative data:' },
        { def: 'Combinations and permutations', text: 'A **permutation** is an arrangement of selected items in an order; a **combination** is a selection without regard to order.' },
        { def: 'Set theory', text: 'Deals with collections of objects.' },
        { def: 'Matrix algebra', text: 'Works with numbers and variables arranged in rows and columns (Unit 2).' },
        { def: 'Determinants', text: 'A value computed from a square matrix; used to solve equations and represent polynomials simply (Unit 3).' },
        { def: 'Differentiation', text: 'Finds the effect of a small change in an independent variable on a dependent variable.' },
        { def: 'Integration', text: 'The converse (reverse) of differentiation.' },
        { def: 'Differential equation', text: 'An equation containing the derivatives (differential factors) of dependent variables.' },
      ],
    },
    {
      id: 'stats1',
      title: 'Techniques based on statistical calculations (1)',
      page: 3,
      body: [
        { p: 'These use statistical tools to analyse data over the same or different periods:' },
        { def: 'Collection of data', text: 'The first step of any statistical method: primary and secondary data.' },
        { def: 'Central tendency', text: 'Estimates where the central values of a distribution concentrate. Five methods: arithmetic mean, mode, geometric mean, harmonic mean, median.' },
        { def: 'Dispersion', text: '"Scatteredness". Spiegel: "the degree to which numerical data tend to spread about an average value". Measures: mean deviation, range, standard deviation and variance, quartile deviation.' },
        { def: 'Skewness', text: 'Lack of symmetry in the shape of the curve: positive, negative or zero skewness.' },
        { def: 'Kurtosis', text: 'The peakedness or flatness of the curve.' },
      ],
    },
    {
      id: 'stats2',
      title: 'Techniques based on statistical calculations (2)',
      page: 4,
      body: [
        { def: 'Correlation and regression', text: 'Correlation measures how closely two variables move together; regression estimates one variable from another.' },
        { bookNote: 'The printed description of correlation and regression repeats the text for "collection of data". The one-line meanings above are the standard ones.' },
        { def: 'Index numbers', text: '"Economic barometers": measure fluctuations in price, production and other quantities over time.' },
        { def: 'Time series analysis', text: 'Studies the effect of the factors that cause change over a period.' },
        { def: 'Interpolation and extrapolation', text: 'Interpolation estimates missing values **within** the range of given figures; extrapolation estimates **outside** it.' },
        { def: 'Statistical quality control', text: 'Measures and controls the quality of goods and services, using charts.' },
        { def: 'Ratio analysis', text: 'Analyses financial statements and compares data in different units.' },
        { def: 'Probability theory', text: 'Assigns numerical values to the chance of an event occurring.' },
        { def: 'Testing of hypothesis', text: 'Evaluates two statements to decide which the sample supports.' },
      ],
    },
    {
      id: 'prog',
      title: 'Techniques based on programming',
      page: 4,
      body: [
        { p: 'Model-building techniques that use computer algorithms to help decision makers:' },
        { def: 'Linear programming', text: 'Finds the best outcome of a model expressed in linear equations.' },
        { def: 'Queuing theory', text: 'Studies waiting lines: waiting and service times.' },
        { def: 'Game theory', text: 'Two or more players seeking the best outcome under rules.' },
        { def: 'Decision theory', text: 'Optimal decisions under different levels of risk or expectation.' },
        { def: 'Inventory theory', text: 'Designs the production or inventory system that minimises cost.' },
        { def: 'Network programming', text: 'Plans, monitors and coordinates large projects of many activities (allocating resources, adjusting times).' },
        { def: 'Simulation', text: 'Tests a model that resembles a practical situation.' },
        { def: 'Non-linear programming', text: 'Finds optimum solutions with non-linear equalities and inequalities.' },
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
      id: 'case',
      title: 'A decision: launch B or revive A?',
      page: 5,
      body: [
        { p: 'A company\'s product A is near **saturation** in its life cycle. Should it launch a new product B now, or use the funds to revive A\'s market share, since A is already well known? QT helps in several ways:' },
        { def: 'Cost-benefit analysis', text: 'Compare the total cost required for A and B, using mathematical and statistical models, then decide.' },
        { def: 'Gathering market data', text: 'Gauge customers\' interest in the new product with hypothesis testing, sample surveys and similar techniques.' },
        { def: 'Applying statistical models', text: 'Models such as factor analysis and cluster sampling show the reach of the old product against the new one.' },
        { def: 'Constructing financial models', text: 'Linear programming models can find the optimum cost and the maximum profit.' },
      ],
    },
    {
      id: 'areas1',
      title: 'QT across management areas (1)',
      page: 6,
      body: [
        { p: 'QT is not limited to one department; it is part of decision making across the organisation.' },
        { def: 'Marketing', text: 'Market research analysis; statistical records for the upkeep of a vast market; sales planning and projections.' },
        { def: 'Production', text: 'Planning and controlling production; performance evaluation of a machine; requirements for quality control; measures for inventory control.' },
      ],
    },
    {
      id: 'areas2',
      title: 'QT across management areas (2)',
      page: 6,
      body: [
        { def: 'Accounting, investment and finance', text: 'Preparing budgets and forecasting financial performance; financial investment decisions; selection of securities; carrying out audits; credit policies, delinquent accounts and credit risk.' },
        { def: 'Personnel', text: 'Labour turnover rate; employment trends; performance appraisal; wage rates and incentive plans.' },
        { p: '**Summary:** QT is applied widely because decision making is complicated and essential. Progress in computers encourages more sophisticated analysis. Yet the qualitative ability of the decision maker still has a place.' },
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

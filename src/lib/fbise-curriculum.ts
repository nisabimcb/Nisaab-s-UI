import {
  StemSubject,
  StemSubjectInfo,
  NotebookDocument,
  StudySummary,
  AudioPodcastEpisode,
  QuizQuestion,
  WeakSpotRecord,
  MindMapData,
} from '@/types/stem';

export const STEM_SUBJECTS: StemSubjectInfo[] = [
  {
    id: 'physics',
    name: 'Physics (HSSC)',
    code: 'PHY-501',
    grade: 'HSSC-I',
    icon: 'Atom',
    color: '#3b82f6',
    totalChapters: 11,
  },
  {
    id: 'chemistry',
    name: 'Chemistry (HSSC)',
    code: 'CHM-502',
    grade: 'HSSC-I',
    icon: 'FlaskConical',
    color: '#06b6d4',
    totalChapters: 12,
  },
  {
    id: 'computer_science',
    name: 'Computer Science (ICS)',
    code: 'CSC-503',
    grade: 'HSSC-I',
    icon: 'Binary',
    color: '#8b5cf6',
    totalChapters: 10,
  },
  {
    id: 'biology',
    name: 'Biology (HSSC)',
    code: 'BIO-504',
    grade: 'HSSC-I',
    icon: 'Dna',
    color: '#10b981',
    totalChapters: 14,
  },
  {
    id: 'mathematics',
    name: 'Mathematics (HSSC)',
    code: 'MTH-505',
    grade: 'HSSC-I',
    icon: 'Sigma',
    color: '#f59e0b',
    totalChapters: 14,
  },
];

export const PRELOADED_DOCUMENTS: NotebookDocument[] = [
  {
    id: 'doc-phy-11',
    subject: 'physics',
    title: 'Thermodynamics & Heat Engines (FBISE Chapter 11)',
    chapter: 'Chapter 11: Heat and Thermodynamics',
    sourceType: 'textbook',
    uploadedAt: '2026-09-25T10:00:00Z',
    content: `Thermodynamics deals with heat transfer, temperature relationships, and mechanical work in closed and open systems.
In FBISE Physics Chapter 11, the First Law of Thermodynamics establishes the conservation of energy: ΔQ = ΔU + W, where ΔQ is heat supplied, ΔU is change in internal energy, and W is work done by the system (W = P·ΔV for isobaric expansion).

Carnot Engine and the Second Law:
Sadi Carnot (1824) devised an idealized reversible heat engine operating between two temperatures: Hot Reservoir (T1 in Kelvin) and Cold Reservoir (T2 in Kelvin).
The Carnot Cycle consists of 4 distinct thermodynamic strokes:
1. Reversible Isothermal Expansion at constant high temperature T1 (absorbs heat Q1).
2. Reversible Adiabatic Expansion (temperature drops from T1 to T2 with no heat exchange, dQ=0).
3. Reversible Isothermal Compression at constant cold temperature T2 (rejects heat Q2).
4. Reversible Adiabatic Compression (temperature rises from T2 back to T1, completing the cycle).

Carnot Engine Efficiency:
Efficiency η = W / Q1 = (Q1 - Q2) / Q1 = 1 - (Q2 / Q1).
For an ideal Carnot cycle, Q2/Q1 = T2/T1, yielding the fundamental FBISE theorem:
η = 1 - (T2 / T1) = (T1 - T2) / T1.
Multiplying by 100 gives percentage efficiency: η% = [1 - (T2/T1)] × 100%.

Crucial FBISE Board Insight:
100% efficiency (η = 1) is impossible in practice because it requires T2 = 0 Kelvin (Absolute Zero), which violates the Third Law of Thermodynamics and Kelvin-Planck statement of the Second Law: No cyclic process can convert heat completely into work without rejecting some heat to a lower-temperature reservoir.`,
  },
  {
    id: 'doc-chm-08',
    subject: 'chemistry',
    title: 'Reaction Kinetics & Catalysis (FBISE Chapter 8)',
    chapter: 'Chapter 8: Chemical Kinetics',
    sourceType: 'textbook',
    uploadedAt: '2026-09-25T10:05:00Z',
    content: `Chemical Kinetics investigates reaction velocities, factors affecting rates, and mechanistic steps.
Rate of reaction is expressed as dx/dt = -d[Reactant]/dt = +d[Product]/dt.

Arrhenius Equation and Activation Energy:
Svante Arrhenius formulated the temperature dependency of reaction rate constants:
k = A · e^(-Ea / (R·T))
Taking the natural logarithm yields:
ln(k) = ln(A) - (Ea / R) · (1 / T)
Plotting ln(k) versus (1/T) produces a straight line with slope m = -Ea / R, providing a direct experimental method for evaluating Activation Energy (Ea) in FBISE laboratory practicals.

Order of Reaction versus Molecularity:
1. Order of reaction is experimental, determined from the rate law exponents: Rate = k[A]^m [B]^n (Order = m + n). It can be zero, fractional, or integer.
2. Molecularity is theoretical: the number of reacting particles colliding in an elementary step (always non-zero whole integer 1, 2, or 3).`,
  },
  {
    id: 'doc-csc-04',
    subject: 'computer_science',
    title: 'Data Structures & Algorithms (FBISE ICS Chapter 4)',
    chapter: 'Chapter 4: Data Structures & Algorithms',
    sourceType: 'textbook',
    uploadedAt: '2026-09-25T10:10:00Z',
    content: `Computer Science ICS focuses on algorithmic efficiency and memory representation.
Linear Data Structures:
1. Arrays: Contiguous memory allocation, O(1) random access by index, O(N) insertion/deletion due to element shifting.
2. Linked Lists: Nodes containing data and reference pointers. Dynamic allocation, O(1) insertion at head/tail, O(N) sequential search.
3. Stacks: LIFO (Last-In-First-Out) principle. Fundamental operations: Push, Pop, Peek in O(1) time complexity. Applications: Recursion call stacks, expression evaluation (Infix to Postfix), undo mechanisms.
4. Queues: FIFO (First-In-First-Out). Operations: Enqueue and Dequeue. Applications: CPU scheduling, printer buffers, breadth-first graph traversal.

Asymptotic Notation in FBISE Syllabus:
Big-O Notation classifies algorithms according to their worst-case run-time growth rate:
- Binary Search: O(log N) — prerequisite: array must be sorted.
- Linear Search: O(N) — works on unsorted structures.
- Bubble Sort / Selection Sort: O(N^2) comparisons.
- Merge Sort / Quick Sort (Average): O(N log N).`,
  },
  {
    id: 'doc-bio-06',
    subject: 'biology',
    title: 'Molecular Genetics & DNA Replication (FBISE Chapter 6)',
    chapter: 'Chapter 6: Chromosomes and DNA',
    sourceType: 'textbook',
    uploadedAt: '2026-09-25T10:15:00Z',
    content: `FBISE HSSC Biology investigates DNA as the hereditary material.
Meselson-Stahl Experiment (1958) proved the Semi-Conservative Model of DNA replication using heavy nitrogen isotopes (15N and 14N) and CsCl density gradient centrifugation.

Enzyme Machinery at the Replication Fork:
1. Helicase: Unwinds the double helix by breaking hydrogen bonds between base pairs, generating replication forks.
2. Single-Strand DNA-Binding Proteins (SSBs): Stabilize single-stranded DNA and prevent re-annealing.
3. Topoisomerase (DNA Gyrase): Relieves supercoiling and torsional strain ahead of the advancing fork.
4. Primase (RNA Polymerase): Synthesizes short RNA primers (10-12 nucleotides) to provide a 3'-OH group required by DNA Polymerase.
5. DNA Polymerase III: Primary enzyme synthesizing nascent strands strictly in the 5' -> 3' direction.
   - Leading Strand: Continuous synthesis toward the replication fork.
   - Lagging Strand: Discontinuous synthesis away from the fork, forming Okazaki Fragments (1000-2000 nucleotides).
6. DNA Polymerase I: Removes RNA primers and replaces them with deoxyribonucleotides (exonuclease activity).
7. DNA Ligase: Catalyzes phosphodiester bond formation between Okazaki fragments to seal the nick.`,
  },
  {
    id: 'doc-mth-02',
    subject: 'mathematics',
    title: 'Differentiation & Limits (FBISE Mathematics Chapter 2)',
    chapter: 'Chapter 2: Differentiation',
    sourceType: 'textbook',
    uploadedAt: '2026-09-25T10:20:00Z',
    content: `Calculus is central to FBISE HSSC-II Mathematics.
Derivative from First Principles (ab initio / delta method):
f'(x) = lim (δx -> 0) [f(x + δx) - f(x)] / δx.

Fundamental Rules of Differentiation:
1. Product Rule: d/dx [u · v] = u · (dv/dx) + v · (du/dx).
2. Quotient Rule: d/dx [u / v] = [v · (du/dx) - u · (dv/dx)] / v^2 (where v ≠ 0).
3. Chain Rule: For composite function y = f(g(x)), let u = g(x), then dy/dx = (dy/du) · (du/dx).

Applications in Board Problems:
- Rate of change: dy/dx represents instantaneous rate.
- Tangents and Normals: Slope of tangent m = dy/dx evaluated at (x1, y1). Slope of normal = -1/m.
- Maxima and Minima: Critical points occur where f'(x) = 0.
  - If f''(x) < 0 at critical point -> Local Maximum.
  - If f''(x) > 0 at critical point -> Local Minimum.`,
  },
];

export const PRELOADED_SUMMARIES: Record<StemSubject, StudySummary> = {
  physics: {
    executiveSummary:
      'Thermodynamics governs thermal energy transformations. The Carnot cycle sets the theoretical upper ceiling for heat engine efficiency operating between temperatures T1 (hot) and T2 (cold). Real thermal engines can never exceed or match Carnot efficiency due to internal irreversibility, friction, and entropy generation.',
    keyFormulasAndDefinitions: [
      'First Law of Thermodynamics: ΔQ = ΔU + W (where W = P·ΔV)',
      'Carnot Engine Efficiency: η = 1 - (T2 / T1) = (T1 - T2) / T1 [Temperatures strictly in Kelvin]',
      'Ideal Gas State Equation: P·V = n·R·T',
      'Adiabatic Process Condition: P·V^γ = constant (where γ = Cp / Cv)',
    ],
    boardExamPitfalls: [
      'Students frequently forget to convert Celsius to Kelvin (K = °C + 273.15). Using Celsius in η = 1 - (T2/T1) results in 0 marks.',
      'Confusing Work Done BY the gas (+W) with Work Done ON the gas (-W) in first law sign conventions.',
      'Assuming that a Carnot engine can achieve 100% efficiency if friction is removed (100% requires T2 = 0 K, which is thermodynamically inaccessible).',
    ],
    suggestedReviewQuestions: [
      'Prove that the efficiency of an ideal Carnot engine depends only on the temperatures of heat reservoirs and not on the working substance.',
      'A heat engine absorbs 2000 J of heat from a reservoir at 500 K and exhausts 1200 J to a sink at 300 K. Calculate its actual efficiency and compare it with maximum theoretical Carnot efficiency.',
    ],
  },
  chemistry: {
    executiveSummary:
      'Reaction kinetics explores the mechanism and velocity of chemical transformations. Reaction order is determined empirically from rate equations, while molecularity represents theoretical collision counts. The Arrhenius equation mathematically connects activation energy with temperature sensitivity.',
    keyFormulasAndDefinitions: [
      'Differential Rate Law: Rate = k · [A]^m · [B]^n (Order = m + n)',
      'Arrhenius Equation: k = A · e^(-Ea / RT)',
      'Logarithmic Arrhenius Form: ln(k2/k1) = (Ea / R) · [(T2 - T1) / (T1 · T2)]',
      'Half-life of First Order Reaction: t_1/2 = 0.693 / k (independent of initial concentration)',
    ],
    boardExamPitfalls: [
      'Conflating Reaction Order (can be fractional or zero) with Molecularity (strictly positive integers).',
      'Forgetting that catalysts lower the activation energy barrier for both forward and reverse reactions equally, without altering the equilibrium constant Kc.',
    ],
    suggestedReviewQuestions: [
      'Distinguish between zero-order and first-order reactions with examples and rate constant units.',
      'Derive the integrated rate equation for a first-order reaction and show that its half-life is independent of reactant concentration.',
    ],
  },
  computer_science: {
    executiveSummary:
      'Data structures organize data in computer memory for optimal access and processing efficiency. Linear structures (arrays, linked lists, stacks, queues) provide predictable algorithmic complexity. Big-O notation measures asymptotic worst-case bounds.',
    keyFormulasAndDefinitions: [
      'Stack LIFO: Push O(1), Pop O(1), Peek O(1)',
      'Queue FIFO: Enqueue O(1), Dequeue O(1)',
      'Binary Search: O(log N) runtime, requires sorted array',
      'Merge Sort: O(N log N) divide-and-conquer time complexity',
    ],
    boardExamPitfalls: [
      'Attempting to apply Binary Search on an unsorted array in algorithmic design questions.',
      'Stack Overflow versus Stack Underflow: popping from an empty stack causes underflow; pushing to a full fixed-size stack causes overflow.',
    ],
    suggestedReviewQuestions: [
      'Compare Stack and Queue operations with real-world computer systems examples.',
      'Write an algorithm for Binary Search in pseudocode and trace it with an 8-element sorted array.',
    ],
  },
  biology: {
    executiveSummary:
      'Molecular biology establishes the flow of genetic information. DNA replication follows a semi-conservative mechanism where each daughter duplex contains one parental and one newly synthesized strand, orchestrated by coordinated multi-enzyme complexes at the replication fork.',
    keyFormulasAndDefinitions: [
      'Leading Strand: Continuous synthesis 5\' -> 3\' toward fork',
      'Lagging Strand: Discontinuous Okazaki fragments synthesized 5\' -> 3\' away from fork',
      'Meselson-Stahl density: 15N (heavy) -> 15N-14N (hybrid) -> 14N (light)',
    ],
    boardExamPitfalls: [
      'Stating that DNA Polymerase synthesizes in the 3\' -> 5\' direction. DNA Polymerase ONLY adds nucleotides to the 3\'-OH group, synthesizing in 5\' -> 3\'.',
      'Omitting the role of RNA Primase before DNA Polymerase III action.',
    ],
    suggestedReviewQuestions: [
      'Explain the experimental proof provided by Meselson and Stahl for the semi-conservative replication of DNA.',
      'Detail the functions of Helicase, Primase, and DNA Ligase at the replication fork.',
    ],
  },
  mathematics: {
    executiveSummary:
      'Differential calculus measures instantaneous rates of change. The derivative is formulated geometrically as the tangent slope and analytically via limits. Critical points (f\'(x) = 0) combined with second derivative tests pinpoint local maxima and minima.',
    keyFormulasAndDefinitions: [
      'Definition of Derivative: f\'(x) = lim(h->0) [f(x+h) - f(x)] / h',
      'Product Rule: (uv)\' = u\'v + uv\'',
      'Quotient Rule: (u/v)\' = (u\'v - uv\') / v^2',
      'Second Derivative Test: f\'\'(x) > 0 implies minimum; f\'\'(x) < 0 implies maximum',
    ],
    boardExamPitfalls: [
      'Applying the quotient rule with reversed numerator sign (writing uv\' - u\'v instead of u\'v - uv\').',
      'Forgetting the chain rule when differentiating trigonometric functions with composite arguments (e.g. d/dx[sin(2x)] = 2 cos(2x), not just cos(2x)).',
    ],
    suggestedReviewQuestions: [
      'Differentiate y = sin(x) from first principles (ab initio method).',
      'Find the dimensions of a rectangular parcel with fixed perimeter 100 meters that encloses maximum area using calculus.',
    ],
  },
};

export const PRELOADED_PODCASTS: Record<StemSubject, AudioPodcastEpisode> = {
  physics: {
    id: 'pod-phy-01',
    subject: 'physics',
    topic: 'Carnot Heat Engine & The Limits of Thermodynamic Efficiency',
    duration: '2 min 40 sec',
    dialogue: [
      {
        speaker: 'Dr. Sarah (Concept Lead)',
        text: 'Welcome to STEM Intellect FBISE Masterclass. Today, Alex and I are decoding the single most important concept in HSSC Physics Chapter 11: The Carnot Engine.',
        timestamp: '0:00',
      },
      {
        speaker: 'Alex (Student Fellow)',
        text: 'Thanks Dr. Sarah! Whenever students see Carnot efficiency in past board exams, they wonder: why can\'t any real heat engine ever hit 100 percent efficiency, even with zero friction?',
        timestamp: '0:18',
      },
      {
        speaker: 'Dr. Sarah (Concept Lead)',
        text: 'Brilliant question, Alex. Look at Carnot\'s formula: efficiency equals 1 minus T2 divided by T1. T1 is the heat source temperature, and T2 is the heat sink. To make that ratio zero and reach 100% efficiency, T2 would have to be Absolute Zero: zero Kelvin!',
        timestamp: '0:36',
      },
      {
        speaker: 'Alex (Student Fellow)',
        text: 'And according to the Third Law of Thermodynamics, Absolute Zero is impossible to reach in finite steps! Plus, the Kelvin-Planck statement says you must always reject some heat to a cold reservoir.',
        timestamp: '1:02',
      },
      {
        speaker: 'Dr. Sarah (Concept Lead)',
        text: 'Exactly! Also, remember the critical board exam pitfall: temperatures MUST be in Kelvin. If the board gives you 27 degrees Celsius, always add 273 to get 300 Kelvin before computing.',
        timestamp: '1:24',
      },
      {
        speaker: 'Alex (Student Fellow)',
        text: 'That is gold advice. Master the four cycle strokes—two isothermal, two adiabatic—and this topic will secure top marks in your board paper.',
        timestamp: '1:48',
      },
    ],
  },
  chemistry: {
    id: 'pod-chm-01',
    subject: 'chemistry',
    topic: 'Arrhenius Equation & Reaction Activation Energy',
    duration: '2 min 15 sec',
    dialogue: [
      {
        speaker: 'Dr. Sarah (Concept Lead)',
        text: 'Welcome back! In FBISE Chemistry Chapter 8, chemical kinetics isn\'t just about how fast reactions happen—it\'s about overcoming the energetic mountain known as Activation Energy.',
        timestamp: '0:00',
      },
      {
        speaker: 'Alex (Student Fellow)',
        text: 'Right, and Svante Arrhenius gave us that elegant equation: k equals A times e to the power of negative Ea over RT.',
        timestamp: '0:22',
      },
      {
        speaker: 'Dr. Sarah (Concept Lead)',
        text: 'Spot on! When you plot natural log of k versus 1 over T, the slope is negative Ea over R. That slope lets you determine the exact activation energy experimentally!',
        timestamp: '0:45',
      },
    ],
  },
  computer_science: {
    id: 'pod-csc-01',
    subject: 'computer_science',
    topic: 'Stacks, Queues, and Asymptotic Complexity',
    duration: '2 min 20 sec',
    dialogue: [
      {
        speaker: 'Dr. Sarah (Concept Lead)',
        text: 'Hello ICS innovators! Today we\'re exploring linear data structures in Computer Science Chapter 4.',
        timestamp: '0:00',
      },
      {
        speaker: 'Alex (Student Fellow)',
        text: 'Stacks are Last-In-First-Out like cafeteria plates, while Queues are First-In-First-Out like a movie ticket line!',
        timestamp: '0:19',
      },
      {
        speaker: 'Dr. Sarah (Concept Lead)',
        text: 'And in algorithm design, remember that Binary Search requires a sorted list to achieve O(log N) efficiency, cutting your search space in half with every check!',
        timestamp: '0:42',
      },
    ],
  },
  biology: {
    id: 'pod-bio-01',
    subject: 'biology',
    topic: 'The Molecular Dance of the Replication Fork',
    duration: '2 min 30 sec',
    dialogue: [
      {
        speaker: 'Dr. Sarah (Concept Lead)',
        text: 'Welcome medical aspirants! Today we enter the nucleus to watch DNA replication unfold in FBISE Biology Chapter 6.',
        timestamp: '0:00',
      },
      {
        speaker: 'Alex (Student Fellow)',
        text: 'Helicase unzips the double helix, and then Primase lays down RNA primers because DNA Polymerase III can only add to an existing 3-prime OH group!',
        timestamp: '0:25',
      },
      {
        speaker: 'Dr. Sarah (Concept Lead)',
        text: 'And that is why the lagging strand must be synthesized discontinuously in Okazaki fragments, later stitched together seamlessly by DNA Ligase.',
        timestamp: '0:50',
      },
    ],
  },
  mathematics: {
    id: 'pod-mth-01',
    subject: 'mathematics',
    topic: 'Mastering Derivatives: From Limits to Critical Points',
    duration: '2 min 10 sec',
    dialogue: [
      {
        speaker: 'Dr. Sarah (Concept Lead)',
        text: 'Welcome engineers! In Chapter 2 Differentiation, calculus provides the mathematical microscope for instantaneous rates of change.',
        timestamp: '0:00',
      },
      {
        speaker: 'Alex (Student Fellow)',
        text: 'To find maximum or minimum values, we set the first derivative to zero, and then check the sign of the second derivative!',
        timestamp: '0:22',
      },
      {
        speaker: 'Dr. Sarah (Concept Lead)',
        text: 'Exactly! A negative second derivative means concavity downward—a local maximum. A positive second derivative indicates a local minimum.',
        timestamp: '0:44',
      },
    ],
  },
};

export const PRELOADED_QUIZZES: Record<StemSubject, QuizQuestion[]> = {
  physics: [
    {
      id: 'phy-q1',
      question:
        'An ideal heat engine absorbs 1000 J of heat from a reservoir at 400 K and exhausts heat to a sink at 300 K. What is the efficiency of this Carnot engine?',
      options: ['20%', '25%', '33.3%', '75%'],
      correctIndex: 1,
      explanation:
        'η = 1 - (T2 / T1) = 1 - (300 / 400) = 1 - 0.75 = 0.25 = 25%.',
      sloReference: 'FBISE SLO PHY.11.2: Calculate efficiency of Carnot engine from given temperatures.',
      difficulty: 'Application',
    },
    {
      id: 'phy-q2',
      question:
        'Why can an ideal Carnot engine never achieve 100% thermal efficiency in practical operation?',
      options: [
        'Because mechanical friction cannot be fully eliminated in pistons',
        'Because 100% efficiency requires the cold sink to be at Absolute Zero (0 Kelvin), which is unattainable',
        'Because ideal gases condense into liquids at high operating pressures',
        'Because heat capacity varies non-linearly with temperature',
      ],
      correctIndex: 1,
      explanation:
        'Efficiency is η = 1 - (T2/T1). For η = 1 (100%), T2 must be 0 K (Absolute Zero), which violates the Third Law of Thermodynamics.',
      sloReference: 'FBISE SLO PHY.11.3: Explain why 100% heat engine efficiency is thermodynamically impossible.',
      difficulty: 'Conceptual',
    },
    {
      id: 'phy-q3',
      question:
        'In an adiabatic expansion of an ideal gas, which of the following statements is strictly correct?',
      options: [
        'ΔQ = 0 and temperature remains constant',
        'ΔQ = 0 and the internal energy increases',
        'ΔQ = 0 and the internal energy decreases as work is done by the gas',
        'ΔQ > 0 and pressure remains constant',
      ],
      correctIndex: 2,
      explanation:
        'For an adiabatic process, ΔQ = 0. By First Law ΔQ = ΔU + W => 0 = ΔU + W => W = -ΔU. Work done by the gas (+W) comes at the expense of its internal energy (ΔU decreases, temperature drops).',
      sloReference: 'FBISE SLO PHY.11.1: Distinguish between isothermal and adiabatic thermodynamic strokes.',
      difficulty: 'Analytical',
    },
    {
      id: 'phy-q4',
      question:
        'Which pair represents the four sequential processes in a standard Carnot cycle?',
      options: [
        'Two isochoric and two isobaric processes',
        'Two reversible isothermal and two reversible adiabatic processes',
        'One isothermal, one adiabatic, one isobaric, and one isochoric process',
        'Two isothermal and two isochoric processes',
      ],
      correctIndex: 1,
      explanation:
        'The Carnot cycle consists of: 1) Isothermal expansion, 2) Adiabatic expansion, 3) Isothermal compression, 4) Adiabatic compression.',
      sloReference: 'FBISE SLO PHY.11.2: Describe the 4 thermodynamic stages of the Carnot cycle.',
      difficulty: 'Conceptual',
    },
    {
      id: 'phy-q5',
      question:
        'If a heat engine operates between 127°C and 27°C, what is its maximum possible theoretical efficiency?',
      options: ['78.7%', '25.0%', '33.3%', '10.0%'],
      correctIndex: 1,
      explanation:
        'Convert to Kelvin first! T1 = 127 + 273 = 400 K. T2 = 27 + 273 = 300 K. η = 1 - (300 / 400) = 0.25 = 25.0%. (Warning: Using Celsius directly gives 1 - 27/127 = 78.7%, which is a classic board trap!)',
      sloReference: 'FBISE SLO PHY.11.4: Solve quantitative board numericals involving temperature conversion in Carnot cycles.',
      difficulty: 'Application',
    },
  ],
  chemistry: [
    {
      id: 'chm-q1',
      question: 'In the Arrhenius equation k = A·e^(-Ea/RT), what does the slope of a plot of ln(k) versus 1/T represent?',
      options: ['-Ea / R', '+Ea / R', '-Ea / 2.303', 'ln(A)'],
      correctIndex: 0,
      explanation: 'ln(k) = ln(A) - (Ea/R)·(1/T). Equation of line y = c + mx gives slope m = -Ea/R.',
      sloReference: 'FBISE SLO CHM.8.3: Determine activation energy from Arrhenius plots.',
      difficulty: 'Analytical',
    },
    {
      id: 'chm-q2',
      question: 'Which of the following is true regarding a catalyst added to a chemical reaction at equilibrium?',
      options: [
        'It shifts the equilibrium position toward products',
        'It lowers the activation energy for both forward and backward reactions equally',
        'It increases the value of the equilibrium constant Kc',
        'It increases the enthalpy change (ΔH) of the reaction',
      ],
      correctIndex: 1,
      explanation: 'Catalysts provide an alternative pathway with lower Ea for both directions without altering ΔH or Kc.',
      sloReference: 'FBISE SLO CHM.8.5: Explain the effect of catalysts on reaction activation barriers.',
      difficulty: 'Conceptual',
    },
  ],
  computer_science: [
    {
      id: 'csc-q1',
      question: 'What is the worst-case time complexity of Binary Search on a sorted array of N elements?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
      correctIndex: 1,
      explanation: 'Binary Search halves the search space in each iteration, resulting in O(log N) time complexity.',
      sloReference: 'FBISE SLO CSC.4.2: Analyze time complexity of fundamental searching algorithms.',
      difficulty: 'Conceptual',
    },
    {
      id: 'csc-q2',
      question: 'Which data structure operates strictly on the Last-In-First-Out (LIFO) access principle?',
      options: ['Queue', 'Linked List', 'Stack', 'Binary Search Tree'],
      correctIndex: 2,
      explanation: 'Stacks operate on LIFO (Last-In-First-Out), used for function calls and expression evaluation.',
      sloReference: 'FBISE SLO CSC.4.1: Contrast stack and queue memory structures.',
      difficulty: 'Conceptual',
    },
  ],
  biology: [
    {
      id: 'bio-q1',
      question: 'During DNA replication, which enzyme is responsible for synthesizing short RNA primers?',
      options: ['DNA Polymerase I', 'Helicase', 'Primase', 'DNA Ligase'],
      correctIndex: 2,
      explanation: 'Primase (an RNA polymerase) synthesizes short RNA primers to provide a 3\'-OH group for DNA Pol III.',
      sloReference: 'FBISE SLO BIO.6.2: Detail the enzymatic machinery of the replication fork.',
      difficulty: 'Conceptual',
    },
  ],
  mathematics: [
    {
      id: 'mth-q1',
      question: 'If f\'(c) = 0 and f\'\'(c) < 0, what does x = c represent on the curve y = f(x)?',
      options: ['A point of inflection', 'A local minimum', 'A local maximum', 'An asymptote'],
      correctIndex: 2,
      explanation: 'By the second derivative test, f\'\'(c) < 0 indicates concave downward, meaning x = c is a local maximum.',
      sloReference: 'FBISE SLO MTH.2.6: Apply second derivative tests to identify extrema.',
      difficulty: 'Application',
    },
  ],
};

export const INITIAL_WEAK_SPOTS: WeakSpotRecord[] = [
  {
    id: 'ws-phy-01',
    subject: 'physics',
    topic: 'Carnot Cycle Numerical Calculations & Kelvin Scale Conversion',
    chapter: 'Chapter 11: Heat and Thermodynamics',
    masteryPercentage: 58,
    status: 'critical',
    lastAssessed: '2026-09-24T14:30:00Z',
    prescribedRemediation: [
      'Always convert Celsius temperatures to Kelvin (T = °C + 273.15) before applying η = 1 - (T2/T1).',
      'Review First Law sign convention: Work done BY gas is positive (+P·ΔV); work done ON gas is negative.',
      'Practice 3 FBISE past board questions from 2023 & 2024 annual papers on Carnot engine efficiency.',
    ],
  },
  {
    id: 'ws-chm-01',
    subject: 'chemistry',
    topic: 'Arrhenius Plot Slope Analysis & Logarithmic Rate Laws',
    chapter: 'Chapter 8: Chemical Kinetics',
    masteryPercentage: 64,
    status: 'critical',
    lastAssessed: '2026-09-23T11:00:00Z',
    prescribedRemediation: [
      'Remember slope m = -Ea / R for natural log plot, or -Ea / 2.303R for log base 10.',
      'Verify R constant units (use 8.314 J·K^-1·mol^-1 to match Joules for activation energy).',
    ],
  },
];

export const PRELOADED_MINDMAPS: Record<StemSubject, MindMapData> = {
  physics: {
    topic: 'Thermodynamics & Heat Engines',
    subject: 'physics',
    nodes: [
      { id: '1', label: 'Thermodynamics', category: 'core', description: 'Study of heat and work transformations' },
      { id: '2', label: '1st Law: Conservation of Energy', category: 'prerequisite', description: 'ΔQ = ΔU + W' },
      { id: '3', label: 'Isothermal Process (T constant)', category: 'application', description: 'ΔU = 0, ΔQ = W = nRT ln(V2/V1)' },
      { id: '4', label: 'Adiabatic Process (ΔQ = 0)', category: 'application', description: 'W = -ΔU, PV^γ = constant' },
      { id: '5', label: 'Carnot Engine Cycle', category: 'exam_focus', description: 'Reversible theoretical benchmark engine' },
      { id: '6', label: 'Carnot Efficiency η = 1 - (T2/T1)', category: 'exam_focus', description: 'Upper ceiling of thermal efficiency' },
      { id: '7', label: '2nd Law & Entropy Limits', category: 'core', description: 'No heat engine can reach 100% efficiency' },
    ],
    links: [
      { source: '1', target: '2', relation: 'Governed by' },
      { source: '2', target: '3', relation: 'Special stroke' },
      { source: '2', target: '4', relation: 'Special stroke' },
      { source: '3', target: '5', relation: 'Combines into' },
      { source: '4', target: '5', relation: 'Combines into' },
      { source: '5', target: '6', relation: 'Yields' },
      { source: '6', target: '7', relation: 'Constrained by' },
    ],
  },
  chemistry: {
    topic: 'Reaction Kinetics & Catalysis',
    subject: 'chemistry',
    nodes: [
      { id: '1', label: 'Chemical Kinetics', category: 'core', description: 'Rate of reaction and mechanism' },
      { id: '2', label: 'Collision Theory', category: 'prerequisite', description: 'Effective collisions require proper orientation and energy' },
      { id: '3', label: 'Activation Energy (Ea)', category: 'core', description: 'Minimum kinetic energy needed to react' },
      { id: '4', label: 'Arrhenius Equation', category: 'exam_focus', description: 'k = A·e^(-Ea/RT)' },
      { id: '5', label: 'Catalysis Action', category: 'application', description: 'Lowers activation energy for both directions' },
    ],
    links: [
      { source: '1', target: '2', relation: 'Based on' },
      { source: '2', target: '3', relation: 'Defines' },
      { source: '3', target: '4', relation: 'Quantified by' },
      { source: '3', target: '5', relation: 'Modified by' },
    ],
  },
  computer_science: {
    topic: 'Data Structures & Algorithms',
    subject: 'computer_science',
    nodes: [
      { id: '1', label: 'Linear Data Structures', category: 'core', description: 'Sequential memory and pointer structures' },
      { id: '2', label: 'Arrays', category: 'prerequisite', description: 'O(1) indexing, fixed memory size' },
      { id: '3', label: 'Stack (LIFO)', category: 'exam_focus', description: 'Push, Pop, Peek, call-stack implementation' },
      { id: '4', label: 'Queue (FIFO)', category: 'exam_focus', description: 'Enqueue, Dequeue, buffer scheduling' },
      { id: '5', label: 'Binary Search O(log N)', category: 'application', description: 'Fast search on sorted structures' },
    ],
    links: [
      { source: '1', target: '2', relation: 'Implements' },
      { source: '1', target: '3', relation: 'Implements' },
      { source: '1', target: '4', relation: 'Implements' },
      { source: '2', target: '5', relation: 'Enables' },
    ],
  },
  biology: {
    topic: 'DNA Replication & Molecular Genetics',
    subject: 'biology',
    nodes: [
      { id: '1', label: 'DNA Double Helix', category: 'core', description: 'Antiparallel complementary nucleotide strands' },
      { id: '2', label: 'Replication Fork', category: 'core', description: 'Unwound active synthesis zone' },
      { id: '3', label: 'Helicase & Primase', category: 'prerequisite', description: 'Unwinds and lays RNA primer' },
      { id: '4', label: 'DNA Polymerase III', category: 'exam_focus', description: 'Synthesizes leading and lagging strands 5\' to 3\'' },
      { id: '5', label: 'Okazaki Fragments & Ligase', category: 'application', description: 'Discontinuous synthesis sealed by ligase' },
    ],
    links: [
      { source: '1', target: '2', relation: 'Opens into' },
      { source: '2', target: '3', relation: 'Initiated by' },
      { source: '3', target: '4', relation: 'Extended by' },
      { source: '4', target: '5', relation: 'Produces' },
    ],
  },
  mathematics: {
    topic: 'Differentiation & Calculus',
    subject: 'mathematics',
    nodes: [
      { id: '1', label: 'Calculus', category: 'core', description: 'Mathematics of continuous change' },
      { id: '2', label: 'Limits & Ab Initio', category: 'prerequisite', description: 'lim (h->0) [f(x+h) - f(x)] / h' },
      { id: '3', label: 'Differentiation Rules', category: 'core', description: 'Product, Quotient, and Chain rules' },
      { id: '4', label: 'Critical Points f\'(x)=0', category: 'exam_focus', description: 'Tangents parallel to x-axis' },
      { id: '5', label: 'Optimization & Maxima/Minima', category: 'application', description: 'f\'\'(x) test for local extrema' },
    ],
    links: [
      { source: '1', target: '2', relation: 'Founded on' },
      { source: '2', target: '3', relation: 'Produces' },
      { source: '3', target: '4', relation: 'Identifies' },
      { source: '4', target: '5', relation: 'Evaluates' },
    ],
  },
};

import { Subject } from './types';

export const SUBJECTS_LIST = [
  { id: Subject.ECONOMICS, name: 'Economics', icon: 'bar-chart-2' },
  { id: Subject.OCM, name: 'OCM', icon: 'briefcase' },
  { id: Subject.SP, name: 'Secretarial Practice', icon: 'file-text' },
  { id: Subject.BK_ACC, name: 'BK & Accountancy', icon: 'calculator' },
  { id: Subject.ENGLISH, name: 'English', icon: 'book' },
  { id: Subject.MARATHI, name: 'Marathi', icon: 'feather' },
];

// Based on Maharashtra State Board 12th Standard Balbharati Textbook Syllabus (2025-26)
export const MOCK_TOPICS: Record<Subject, string[]> = {
  [Subject.ECONOMICS]: [
    '1. Introduction to Micro and Macro Economics',
    '2. Utility Analysis',
    '3A. Demand Analysis',
    '3B. Elasticity of Demand',
    '4. Supply Analysis',
    '5. Forms of Market',
    '6. Index Numbers',
    '7. National Income',
    '8. Public Finance in India',
    '9. Money Market and Capital Market in India',
    '10. Foreign Trade of India'
  ],
  [Subject.OCM]: [
    '1. Principles of Management',
    '2. Functions of Management',
    '3. Entrepreneurship Development',
    '4. Business Services',
    '5. Emerging Modes of Business',
    '6. Social Responsibilities of Business',
    '7. Consumer Protection',
    '8. Marketing'
  ],
  [Subject.SP]: [
    '1. Introduction to Corporate Finance',
    '2. Sources of Corporate Finance',
    '3. Issue of Shares',
    '4. Issue of Debentures',
    '5. Deposits',
    '6. Correspondence with Members',
    '7. Correspondence with Debentureholders',
    '8. Correspondence with Depositors',
    '9. Depository System',
    '10. Dividend and Interest',
    '11. Financial Market',
    '12. Stock Exchange'
  ],
  [Subject.BK_ACC]: [
    '1. Introduction to Partnership & Partnership Final Accounts',
    '2. Accounts of Not for Profit Concerns',
    '3. Reconstitution of Partnership (Admission of Partner)',
    '4. Reconstitution of Partnership (Retirement of Partner)',
    '5. Reconstitution of Partnership (Death of Partner)',
    '6. Dissolution of Partnership Firm',
    '7. Bills of Exchange',
    '8. Company Accounts - Issue of Shares',
    '9. Analysis of Financial Statements',
    '10. Computer in Accounting'
  ],
  [Subject.ENGLISH]: [
    '1.1 An Astrologer’s Day',
    '1.2 On Saying “Please”',
    '1.3 The Cop and the Anthem',
    '1.4 Big Data-Big Insights',
    '1.5 The New Dress',
    '1.6 Into the Wild',
    '1.7 Why We Travel',
    '1.8 Voyaging Towards Excellence',
    '2.1 Song of the Open Road',
    '2.2 Indian Weavers',
    '2.3 The Inchcape Rock',
    '2.4 Have you Earned your Tomorrow',
    '2.5 Father Returning Home',
    '2.6 Money',
    '2.7 She Walks in Beauty',
    '2.8 Small Towns and Rivers',
    '3.1 Summary Writing',
    '3.2 Do Schools Kill Creativity?',
    '3.3 Note-Making',
    '3.4 Statement of Purpose',
    '3.5 Drafting a Virtual Message',
    '3.6 Group Discussion',
    '4.1 History of Novel',
    '4.2 To Sir, with Love',
    '4.3 Around the World in Eighty Days',
    '4.4 The Sign of Four'
  ],
  [Subject.MARATHI]: [
    'Part 1: Vegvashyata',
    'Part 1: Roj Matit (Kavita)',
    'Part 1: Aayushya... Aavanda Ghetana',
    'Part 1: Re Thamb Zara Aashadghana (Kavita)',
    'Part 1: Dantkatha',
    'Part 1: Rang Resha Vyangresha',
    'Part 2: Vinchu Chavla (Bharud)',
    'Part 2: Reshimbandh',
    'Part 3: Sahitya Prakar - Katha',
    'Part 4: Mulakhat (Interview)',
    'Part 4: Mahiti Patrak',
    'Part 4: Ahawal Lekhan',
    'Part 5: Vyakaran (Grammar)'
  ],
};

export const INITIAL_USER_PROFILE = {
  name: '',
  college: '',
  targetScore: 90,
  streak: 0,
  completedTests: 0,
  questionsSolved: 0,
  onboardingComplete: false,
  xp: 0,
  level: 1,
  coins: 0
};

export const RANDOM_OPPONENT_NAMES = [
  "Aarav Patel", "Vihaan Deshmukh", "Aditya Joshi", "Sai Kulkarni", 
  "Ananya Singh", "Diya Sharma", "Pari Mehta", "Riya Gupta", 
  "Sneha Patil", "Rahul Chavan", "Rohit Shinde", "Pari Pawar", 
  "Amit Gaikwad", "Neha More", "Tanvi Jadhav", "Omkar Sawant"
];

export const LANGUAGES = [
  { id: 'English', name: 'English', voice: 'Kore' },
  { id: 'Marathi', name: 'Marathi', voice: 'Puck' },
  { id: 'Hindi', name: 'Hindi', voice: 'Zephyr' },
  { id: 'Tamil', name: 'Tamil', voice: 'Fenrir' },
  { id: 'Telugu', name: 'Telugu', voice: 'Charon' },
];
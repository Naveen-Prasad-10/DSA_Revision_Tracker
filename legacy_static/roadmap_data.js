/**
 * roadmap_data.js — 8-Week DSA Roadmap Data
 *
 * Each week contains:
 *   week    : week number
 *   topic   : main DSA topic
 *   new     : list of new problems { id, name }
 *   revision: list of revision problems { id, name }
 *
 * Slug generation: lowercase name, replace spaces/special chars with hyphens.
 */

const ROADMAP_RULES = {
  totalPerWeek: "12–15 problems",
  newPerWeek: "8–9",
  revisionPerWeek: "4–6",
  difficulty: "~70% Easy / 30% Medium",
  language: "Python",
};

const ROADMAP = [
  {
    week: 1,
    topic: "Arrays",
    new: [
      { id: 121, name: "Best Time to Buy and Sell Stock" },
      { id: 53,  name: "Maximum Subarray" },
      { id: 283, name: "Move Zeroes" },
      { id: 26,  name: "Remove Duplicates from Sorted Array" },
      { id: 88,  name: "Merge Sorted Array" },
      { id: 485, name: "Max Consecutive Ones" },
      { id: 448, name: "Find All Numbers Disappeared in an Array" },
      { id: 414, name: "Third Maximum Number" },
      { id: 73,  name: "Set Matrix Zeroes" },
    ],
    revision: [
      { id: 1,    name: "Two Sum" },
      { id: 217,  name: "Contains Duplicate" },
      { id: 268,  name: "Missing Number" },
      { id: 27,   name: "Remove Element" },
      { id: 1929, name: "Concatenation of Array" },
    ],
  },
  {
    week: 2,
    topic: "Arrays + Hashing",
    new: [
      { id: 128, name: "Longest Consecutive Sequence" },
      { id: 238, name: "Product of Array Except Self" },
      { id: 560, name: "Subarray Sum Equals K" },
      { id: 347, name: "Top K Frequent Elements" },
      { id: 36,  name: "Valid Sudoku" },
      { id: 41,  name: "First Missing Positive" },
      { id: 169, name: "Majority Element" },
      { id: 229, name: "Majority Element II" },
      { id: 525, name: "Contiguous Array" },
    ],
    revision: [
      { id: 49,   name: "Group Anagrams" },
      { id: 532,  name: "K-diff Pairs in an Array" },
      { id: 242,  name: "Valid Anagram" },
      { id: 1002, name: "Find Common Characters" },
      { id: 1668, name: "Maximum Repeating Substring" },
    ],
  },
  {
    week: 3,
    topic: "Sliding Window",
    new: [
      { id: 3,    name: "Longest Substring Without Repeating Characters" },
      { id: 424,  name: "Longest Repeating Character Replacement" },
      { id: 209,  name: "Minimum Size Subarray Sum" },
      { id: 11,   name: "Container With Most Water" },
      { id: 904,  name: "Fruit Into Baskets" },
      { id: 1493, name: "Longest Subarray of 1s After Deleting One Element" },
      { id: 713,  name: "Subarray Product Less Than K" },
      { id: 76,   name: "Minimum Window Substring" },
      { id: 567,  name: "Permutation in String" },
    ],
    revision: [
      { id: 344, name: "Reverse String" },
      { id: 125, name: "Valid Palindrome" },
      { id: 28,  name: "Find the Index of the First Occurrence in a String" },
      { id: 58,  name: "Length of Last Word" },
      { id: 796, name: "Rotate String" },
    ],
  },
  {
    week: 4,
    topic: "Stack + Recursion",
    new: [
      { id: 150, name: "Evaluate Reverse Polish Notation" },
      { id: 739, name: "Daily Temperatures" },
      { id: 22,  name: "Generate Parentheses" },
      { id: 46,  name: "Permutations" },
      { id: 78,  name: "Subsets" },
      { id: 17,  name: "Letter Combinations of a Phone Number" },
      { id: 39,  name: "Combination Sum" },
      { id: 40,  name: "Combination Sum II" },
      { id: 131, name: "Palindrome Partitioning" },
    ],
    revision: [
      { id: 20,   name: "Valid Parentheses" },
      { id: 1047, name: "Remove All Adjacent Duplicates In String" },
      { id: 155,  name: "Min Stack" },
      { id: 9,    name: "Palindrome Number" },
      { id: 509,  name: "Fibonacci Number" },
    ],
  },
  {
    week: 5,
    topic: "Linked List",
    new: [
      { id: 206, name: "Reverse Linked List" },
      { id: 141, name: "Linked List Cycle" },
      { id: 19,  name: "Remove Nth Node From End of List" },
      { id: 21,  name: "Merge Two Sorted Lists" },
      { id: 2,   name: "Add Two Numbers" },
      { id: 160, name: "Intersection of Two Linked Lists" },
      { id: 876, name: "Middle of the Linked List" },
      { id: 143, name: "Reorder List" },
    ],
    revision: [
      { id: 206, name: "Reverse Linked List" },
      { id: 141, name: "Linked List Cycle" },
      { id: 21,  name: "Merge Two Sorted Lists" },
      { id: 19,  name: "Remove Nth Node From End of List" },
      { id: 2,   name: "Add Two Numbers" },
    ],
  },
  {
    week: 6,
    topic: "Trees",
    new: [
      { id: 104, name: "Maximum Depth of Binary Tree" },
      { id: 226, name: "Invert Binary Tree" },
      { id: 100, name: "Same Tree" },
      { id: 102, name: "Binary Tree Level Order Traversal" },
      { id: 112, name: "Path Sum" },
      { id: 144, name: "Binary Tree Preorder Traversal" },
      { id: 94,  name: "Binary Tree Inorder Traversal" },
      { id: 98,  name: "Validate Binary Search Tree" },
      { id: 230, name: "Kth Smallest Element in a BST" },
    ],
    revision: [
      { id: 104, name: "Maximum Depth of Binary Tree" },
      { id: 102, name: "Binary Tree Level Order Traversal" },
      { id: 100, name: "Same Tree" },
      { id: 226, name: "Invert Binary Tree" },
      { id: 112, name: "Path Sum" },
    ],
  },
  {
    week: 7,
    topic: "Binary Search",
    new: [
      { id: 33,   name: "Search in Rotated Sorted Array" },
      { id: 153,  name: "Find Minimum in Rotated Sorted Array" },
      { id: 34,   name: "Find First and Last Position of Element in Sorted Array" },
      { id: 74,   name: "Search a 2D Matrix" },
      { id: 875,  name: "Koko Eating Bananas" },
      { id: 1011, name: "Capacity To Ship Packages Within D Days" },
      { id: 162,  name: "Find Peak Element" },
      { id: 540,  name: "Single Element in a Sorted Array" },
    ],
    revision: [
      { id: 704, name: "Binary Search" },
      { id: 35,  name: "Search Insert Position" },
      { id: 69,  name: "Sqrt(x)" },
      { id: 50,  name: "Pow(x, n)" },
      { id: 162, name: "Find Peak Element" },
    ],
  },
  {
    week: 8,
    topic: "Mixed Review",
    new: [
      { id: 55,  name: "Jump Game" },
      { id: 45,  name: "Jump Game II" },
      { id: 62,  name: "Unique Paths" },
      { id: 70,  name: "Climbing Stairs" },
      { id: 198, name: "House Robber" },
      { id: 322, name: "Coin Change" },
    ],
    revision: [
      { id: 3,   name: "Longest Substring Without Repeating Characters" },
      { id: 128, name: "Longest Consecutive Sequence" },
      { id: 206, name: "Reverse Linked List" },
      { id: 104, name: "Maximum Depth of Binary Tree" },
      { id: 33,  name: "Search in Rotated Sorted Array" },
      { id: 53,  name: "Maximum Subarray" },
      { id: 560, name: "Subarray Sum Equals K" },
    ],
  },
];

/**
 * roadmapData.js — 4-Week Interview Preparation Curriculum
 */

// Start date: June 4, 2026
export const START_DATE = new Date("2026-06-04T00:00:00");

let topicIndex = 0;
const nextTopicOffsets = () => {
  const d1 = topicIndex * 2;
  const d2 = topicIndex * 2 + 1;
  topicIndex++;
  return { d1, d2 };
};

const createTopic = (name, p1, p2, p3, p4, p5) => {
  const { d1, d2 } = nextTopicOffsets();
  return {
    name,
    problems: [
      { curriculumId: "c-1", id: p1.id, name: p1.name, difficulty: "Easy", dayOffset: d1 },
      { curriculumId: "c-2", id: p2.id, name: p2.name, difficulty: "Medium", dayOffset: d1 },
      { curriculumId: "c-3", id: p3.id, name: p3.name, difficulty: "Medium", dayOffset: d1 },
      { curriculumId: "c-4", id: p4.id, name: p4.name, difficulty: "Medium", dayOffset: d2 },
      { curriculumId: "c-5", id: p5.id, name: p5.name, difficulty: "Hard", dayOffset: d2 },
    ]
  };
};

export const CURRICULUM = [
  {
    week: 1,
    topics: [
      createTopic(
        "Arrays",
        { curriculumId: "c-6", id: 1, name: "Two Sum" },
        { curriculumId: "c-7", id: 121, name: "Best Time to Buy and Sell Stock" },
        { curriculumId: "c-8", id: 238, name: "Product of Array Except Self" },
        { curriculumId: "c-9", id: 11, name: "Container With Most Water" },
        { curriculumId: "c-10", id: 42, name: "Trapping Rain Water" }
      ),
      createTopic(
        "Strings",
        { curriculumId: "c-11", id: 242, name: "Valid Anagram" },
        { curriculumId: "c-12", id: 3, name: "Longest Substring Without Repeating Characters" },
        { curriculumId: "c-13", id: 49, name: "Group Anagrams" },
        { curriculumId: "c-14", id: 5, name: "Longest Palindromic Substring" },
        { curriculumId: "c-15", id: 76, name: "Minimum Window Substring" }
      ),
      createTopic(
        "Hash Maps / Sets",
        { curriculumId: "c-16", id: 217, name: "Contains Duplicate" },
        { curriculumId: "c-17", id: 347, name: "Top K Frequent Elements" },
        { curriculumId: "c-18", id: 128, name: "Longest Consecutive Sequence" },
        { curriculumId: "c-19", id: 560, name: "Subarray Sum Equals K" },
        { curriculumId: "c-20", id: 146, name: "LRU Cache" }
      ),
      createTopic(
        "Stacks / Queues",
        { curriculumId: "c-21", id: 20, name: "Valid Parentheses" },
        { curriculumId: "c-22", id: 739, name: "Daily Temperatures" },
        { curriculumId: "c-23", id: 503, name: "Next Greater Element II" },
        { curriculumId: "c-24", id: 150, name: "Evaluate Reverse Polish Notation" },
        { curriculumId: "c-25", id: 84, name: "Largest Rectangle in Histogram" }
      ),
      createTopic(
        "Linked Lists",
        { curriculumId: "c-26", id: 206, name: "Reverse Linked List" },
        { curriculumId: "c-27", id: 141, name: "Linked List Cycle" },
        { curriculumId: "c-28", id: 143, name: "Reorder List" },
        { curriculumId: "c-29", id: 19, name: "Remove Nth Node From End of List" }, // LeetCode names it with 'of List'
        { curriculumId: "c-30", id: 23, name: "Merge K Sorted Lists" }
      )
    ]
  },
  {
    week: 2,
    topics: [
      createTopic(
        "Binary Search",
        { curriculumId: "c-31", id: 704, name: "Binary Search" },
        { curriculumId: "c-32", id: 33, name: "Search in Rotated Sorted Array" },
        { curriculumId: "c-33", id: 162, name: "Find Peak Element" },
        { curriculumId: "c-34", id: 875, name: "Koko Eating Bananas" },
        { curriculumId: "c-35", id: 4, name: "Median of Two Sorted Arrays" }
      ),
      createTopic(
        "Trees / BST",
        { curriculumId: "c-36", id: 104, name: "Maximum Depth of Binary Tree" },
        { curriculumId: "c-37", id: 98, name: "Validate Binary Search Tree" },
        { curriculumId: "c-38", id: 236, name: "Lowest Common Ancestor of a Binary Tree" },
        { curriculumId: "c-39", id: 102, name: "Binary Tree Level Order Traversal" },
        { curriculumId: "c-40", id: 105, name: "Construct Binary Tree from Preorder and Inorder Traversal" }
      ),
      createTopic(
        "Heap / Priority Queue",
        { curriculumId: "c-41", id: 703, name: "Kth Largest Element in a Stream" },
        { curriculumId: "c-42", id: 973, name: "K Closest Points to Origin" },
        { curriculumId: "c-43", id: 295, name: "Find Median from Data Stream" },
        { curriculumId: "c-44", id: 621, name: "Task Scheduler" },
        { curriculumId: "c-45", id: 23, name: "Merge K Sorted Lists (Heap Version)" }
      ),
      createTopic(
        "Sliding Window",
        { curriculumId: "c-46", id: 643, name: "Maximum Average Subarray I" },
        { curriculumId: "c-47", id: 567, name: "Permutation in String" },
        { curriculumId: "c-48", id: 424, name: "Longest Repeating Character Replacement" },
        { curriculumId: "c-49", id: 904, name: "Fruit Into Baskets" },
        { curriculumId: "c-50", id: 239, name: "Sliding Window Maximum" }
      ),
      createTopic(
        "Recursion / Backtracking",
        { curriculumId: "c-51", id: 78, name: "Subsets" },
        { curriculumId: "c-52", id: 39, name: "Combination Sum" },
        { curriculumId: "c-53", id: 46, name: "Permutations" },
        { curriculumId: "c-54", id: 17, name: "Letter Combinations of a Phone Number" },
        { curriculumId: "c-55", id: 51, name: "N-Queens" }
      )
    ]
  },
  {
    week: 3,
    topics: [
      createTopic(
        "Graphs",
        { curriculumId: "c-56", id: 1971, name: "Find if Path Exists in Graph" },
        { curriculumId: "c-57", id: 200, name: "Number of Islands" },
        { curriculumId: "c-58", id: 133, name: "Clone Graph" },
        { curriculumId: "c-59", id: 207, name: "Course Schedule" },
        { curriculumId: "c-60", id: 417, name: "Pacific Atlantic Water Flow" }
      ),
      createTopic(
        "BFS / DFS",
        { curriculumId: "c-61", id: 733, name: "Flood Fill" },
        { curriculumId: "c-62", id: 994, name: "Rotting Oranges" },
        { curriculumId: "c-63", id: 127, name: "Word Ladder" },
        { curriculumId: "c-64", id: 130, name: "Surrounded Regions" },
        { curriculumId: "c-65", id: 752, name: "Open the Lock" }
      ),
      createTopic(
        "Dynamic Programming I",
        { curriculumId: "c-66", id: 70, name: "Climbing Stairs" },
        { curriculumId: "c-67", id: 198, name: "House Robber" },
        { curriculumId: "c-68", id: 322, name: "Coin Change" },
        { curriculumId: "c-69", id: 300, name: "Longest Increasing Subsequence" },
        { curriculumId: "c-70", id: 416, name: "Partition Equal Subset Sum" }
      ),
      createTopic(
        "Greedy",
        { curriculumId: "c-71", id: 455, name: "Assign Cookies" },
        { curriculumId: "c-72", id: 55, name: "Jump Game" },
        { curriculumId: "c-73", id: 134, name: "Gas Station" },
        { curriculumId: "c-74", id: 763, name: "Partition Labels" },
        { curriculumId: "c-75", id: 56, name: "Merge Intervals" } // Technically Hard is specified, Merge Intervals is medium typically but we use Hard here per requirements
      ),
      createTopic(
        "Intervals",
        { curriculumId: "c-76", id: 252, name: "Meeting Rooms" }, // Easy
        { curriculumId: "c-77", id: 57, name: "Insert Interval" },
        { curriculumId: "c-78", id: 56, name: "Merge Intervals (Review)" },
        { curriculumId: "c-79", id: 435, name: "Non-overlapping Intervals" },
        { curriculumId: "c-80", id: 759, name: "Employee Free Time" }
      )
    ]
  },
  {
    week: 4,
    topics: [
      createTopic(
        "Dynamic Programming II",
        { curriculumId: "c-81", id: 91, name: "Decode Ways" }, // We'll put Decode Ways as Easy placeholder to fit createTopic, wait, DP2 has no Easy in user prompt: Decode Ways (Medium), Unique Paths (Medium)... I will adjust createTopic or just make a custom one.
        { curriculumId: "c-82", id: 62, name: "Unique Paths" },
        { curriculumId: "c-83", id: 139, name: "Word Break" },
        { curriculumId: "c-84", id: 1143, name: "Longest Common Subsequence" },
        { curriculumId: "c-85", id: 72, name: "Edit Distance" }
      ),
      createTopic(
        "Advanced Trees",
        { curriculumId: "c-86", id: 297, name: "Serialize and Deserialize Binary Tree" }, // Medium placeholder
        { curriculumId: "c-87", id: 199, name: "Binary Tree Right Side View" },
        { curriculumId: "c-88", id: 230, name: "Kth Smallest Element in a BST" },
        { curriculumId: "c-89", id: 437, name: "Path Sum III" },
        { curriculumId: "c-90", id: 124, name: "Binary Tree Maximum Path Sum" }
      ),
      createTopic(
        "Advanced Graphs",
        { curriculumId: "c-91", id: 743, name: "Network Delay Time" }, // Medium placeholder
        { curriculumId: "c-92", id: 787, name: "Cheapest Flights Within K Stops" },
        { curriculumId: "c-93", id: 684, name: "Redundant Connection" },
        { curriculumId: "c-94", id: 1584, name: "Min Cost to Connect All Points" },
        { curriculumId: "c-95", id: 269, name: "Alien Dictionary" }
      ),
      // Mock Interview Week
      (() => {
        const { d1, d2 } = nextTopicOffsets();
        return {
          name: "Mock Interview Week",
          problems: [
            { curriculumId: "c-96", id: 15, name: "3Sum (Array)", difficulty: "Medium", dayOffset: d1 },
            { curriculumId: "c-97", id: 103, name: "Binary Tree Zigzag Level Order Traversal (Tree)", difficulty: "Medium", dayOffset: d1 },
            { curriculumId: "c-98", id: 210, name: "Course Schedule II (Graph)", difficulty: "Medium", dayOffset: d1 },
            { curriculumId: "c-99", id: 322, name: "Coin Change (DP)", difficulty: "Medium", dayOffset: d2 },
            { curriculumId: "c-100", id: 3, name: "Longest Substring Without Repeating Characters (Sliding Window)", difficulty: "Medium", dayOffset: d2 }
          ]
        };
      })()
    ]
  }
];

// Fix difficulty for Week 4 as they were mostly mediums
CURRICULUM[3].topics[0].problems[0].difficulty = "Medium";
CURRICULUM[3].topics[1].problems[0].difficulty = "Medium";
CURRICULUM[3].topics[2].problems[0].difficulty = "Medium";

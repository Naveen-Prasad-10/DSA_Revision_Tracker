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
      { id: p1.id, name: p1.name, difficulty: "Easy", dayOffset: d1 },
      { id: p2.id, name: p2.name, difficulty: "Medium", dayOffset: d1 },
      { id: p3.id, name: p3.name, difficulty: "Medium", dayOffset: d1 },
      { id: p4.id, name: p4.name, difficulty: "Medium", dayOffset: d2 },
      { id: p5.id, name: p5.name, difficulty: "Hard", dayOffset: d2 },
    ]
  };
};

export const CURRICULUM = [
  {
    week: 1,
    topics: [
      createTopic(
        "Arrays",
        { id: 1, name: "Two Sum" },
        { id: 121, name: "Best Time to Buy and Sell Stock" },
        { id: 238, name: "Product of Array Except Self" },
        { id: 11, name: "Container With Most Water" },
        { id: 42, name: "Trapping Rain Water" }
      ),
      createTopic(
        "Strings",
        { id: 242, name: "Valid Anagram" },
        { id: 3, name: "Longest Substring Without Repeating Characters" },
        { id: 49, name: "Group Anagrams" },
        { id: 5, name: "Longest Palindromic Substring" },
        { id: 76, name: "Minimum Window Substring" }
      ),
      createTopic(
        "Hash Maps / Sets",
        { id: 217, name: "Contains Duplicate" },
        { id: 347, name: "Top K Frequent Elements" },
        { id: 128, name: "Longest Consecutive Sequence" },
        { id: 560, name: "Subarray Sum Equals K" },
        { id: 146, name: "LRU Cache" }
      ),
      createTopic(
        "Stacks / Queues",
        { id: 20, name: "Valid Parentheses" },
        { id: 739, name: "Daily Temperatures" },
        { id: 503, name: "Next Greater Element II" },
        { id: 150, name: "Evaluate Reverse Polish Notation" },
        { id: 84, name: "Largest Rectangle in Histogram" }
      ),
      createTopic(
        "Linked Lists",
        { id: 206, name: "Reverse Linked List" },
        { id: 141, name: "Linked List Cycle" },
        { id: 143, name: "Reorder List" },
        { id: 19, name: "Remove Nth Node From End of List" }, // LeetCode names it with 'of List'
        { id: 23, name: "Merge K Sorted Lists" }
      )
    ]
  },
  {
    week: 2,
    topics: [
      createTopic(
        "Binary Search",
        { id: 704, name: "Binary Search" },
        { id: 33, name: "Search in Rotated Sorted Array" },
        { id: 162, name: "Find Peak Element" },
        { id: 875, name: "Koko Eating Bananas" },
        { id: 4, name: "Median of Two Sorted Arrays" }
      ),
      createTopic(
        "Trees / BST",
        { id: 104, name: "Maximum Depth of Binary Tree" },
        { id: 98, name: "Validate Binary Search Tree" },
        { id: 236, name: "Lowest Common Ancestor of a Binary Tree" },
        { id: 102, name: "Binary Tree Level Order Traversal" },
        { id: 105, name: "Construct Binary Tree from Preorder and Inorder Traversal" }
      ),
      createTopic(
        "Heap / Priority Queue",
        { id: 703, name: "Kth Largest Element in a Stream" },
        { id: 973, name: "K Closest Points to Origin" },
        { id: 295, name: "Find Median from Data Stream" },
        { id: 621, name: "Task Scheduler" },
        { id: 23, name: "Merge K Sorted Lists (Heap Version)" }
      ),
      createTopic(
        "Sliding Window",
        { id: 643, name: "Maximum Average Subarray I" },
        { id: 567, name: "Permutation in String" },
        { id: 424, name: "Longest Repeating Character Replacement" },
        { id: 904, name: "Fruit Into Baskets" },
        { id: 239, name: "Sliding Window Maximum" }
      ),
      createTopic(
        "Recursion / Backtracking",
        { id: 78, name: "Subsets" },
        { id: 39, name: "Combination Sum" },
        { id: 46, name: "Permutations" },
        { id: 17, name: "Letter Combinations of a Phone Number" },
        { id: 51, name: "N-Queens" }
      )
    ]
  },
  {
    week: 3,
    topics: [
      createTopic(
        "Graphs",
        { id: 1971, name: "Find if Path Exists in Graph" },
        { id: 200, name: "Number of Islands" },
        { id: 133, name: "Clone Graph" },
        { id: 207, name: "Course Schedule" },
        { id: 417, name: "Pacific Atlantic Water Flow" }
      ),
      createTopic(
        "BFS / DFS",
        { id: 733, name: "Flood Fill" },
        { id: 994, name: "Rotting Oranges" },
        { id: 127, name: "Word Ladder" },
        { id: 130, name: "Surrounded Regions" },
        { id: 752, name: "Open the Lock" }
      ),
      createTopic(
        "Dynamic Programming I",
        { id: 70, name: "Climbing Stairs" },
        { id: 198, name: "House Robber" },
        { id: 322, name: "Coin Change" },
        { id: 300, name: "Longest Increasing Subsequence" },
        { id: 416, name: "Partition Equal Subset Sum" }
      ),
      createTopic(
        "Greedy",
        { id: 455, name: "Assign Cookies" },
        { id: 55, name: "Jump Game" },
        { id: 134, name: "Gas Station" },
        { id: 763, name: "Partition Labels" },
        { id: 56, name: "Merge Intervals" } // Technically Hard is specified, Merge Intervals is medium typically but we use Hard here per requirements
      ),
      createTopic(
        "Intervals",
        { id: 252, name: "Meeting Rooms" }, // Easy
        { id: 57, name: "Insert Interval" },
        { id: 56, name: "Merge Intervals (Review)" },
        { id: 435, name: "Non-overlapping Intervals" },
        { id: 759, name: "Employee Free Time" }
      )
    ]
  },
  {
    week: 4,
    topics: [
      createTopic(
        "Dynamic Programming II",
        { id: 91, name: "Decode Ways" }, // We'll put Decode Ways as Easy placeholder to fit createTopic, wait, DP2 has no Easy in user prompt: Decode Ways (Medium), Unique Paths (Medium)... I will adjust createTopic or just make a custom one.
        { id: 62, name: "Unique Paths" },
        { id: 139, name: "Word Break" },
        { id: 1143, name: "Longest Common Subsequence" },
        { id: 72, name: "Edit Distance" }
      ),
      createTopic(
        "Advanced Trees",
        { id: 297, name: "Serialize and Deserialize Binary Tree" }, // Medium placeholder
        { id: 199, name: "Binary Tree Right Side View" },
        { id: 230, name: "Kth Smallest Element in a BST" },
        { id: 437, name: "Path Sum III" },
        { id: 124, name: "Binary Tree Maximum Path Sum" }
      ),
      createTopic(
        "Advanced Graphs",
        { id: 743, name: "Network Delay Time" }, // Medium placeholder
        { id: 787, name: "Cheapest Flights Within K Stops" },
        { id: 684, name: "Redundant Connection" },
        { id: 1584, name: "Min Cost to Connect All Points" },
        { id: 269, name: "Alien Dictionary" }
      ),
      // Mock Interview Week
      (() => {
        const { d1, d2 } = nextTopicOffsets();
        return {
          name: "Mock Interview Week",
          problems: [
            { id: 15, name: "3Sum (Array)", difficulty: "Medium", dayOffset: d1 },
            { id: 103, name: "Binary Tree Zigzag Level Order Traversal (Tree)", difficulty: "Medium", dayOffset: d1 },
            { id: 210, name: "Course Schedule II (Graph)", difficulty: "Medium", dayOffset: d1 },
            { id: 322, name: "Coin Change (DP)", difficulty: "Medium", dayOffset: d2 },
            { id: 3, name: "Longest Substring Without Repeating Characters (Sliding Window)", difficulty: "Medium", dayOffset: d2 }
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

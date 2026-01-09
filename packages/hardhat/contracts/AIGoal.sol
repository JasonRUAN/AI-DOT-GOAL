// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AIGToken.sol";
contract AIGoal {
    // AIGToken实例
    AIGToken public aigToken;

    // 代币奖励常量
    uint256 constant AIRDROP_AMOUNT_CREATE_GOAL = 100 * 10**18; // 100 AIG
    uint256 constant AIRDROP_AMOUNT_CONFIRM_WITNESS = 50 * 10**18; // 50 AIG
    uint256 constant AIRDROP_AMOUNT_COMPLETE_GOAL = 100 * 10**18; // 100 AIG
    uint256 constant AIRDROP_AMOUNT_FAIL_GOAL = 100 * 10**18; // 100 AIG
    uint256 constant AIRDROP_AMOUNT_CREATE_COMMENT = 10 * 10**18; // 10 AIG
    uint256 constant AIRDROP_AMOUNT_UPDATE_PROGRESS = 10 * 10**18; // 10 AIG
    uint256 constant AIRDROP_AMOUNT_CREATE_AGENT = 200 * 10**18; // 200 AIG
    uint256 constant AIRDROP_AMOUNT_UPDATE_AGENT = 100 * 10**18; // 100 AIG

    // 目标状态枚举
    uint8 constant GOAL_STATUS_ACTIVE = 0;
    uint8 constant GOAL_STATUS_COMPLETED = 1;
    uint8 constant GOAL_STATUS_FAILED = 2;

    // 常量
    uint256 constant MIN_LENGTH = 1;
    uint256 constant AGENT_ID_LENGTH = 36;
    uint256 constant CHARACTER_JSON_MIN_LENGTH = 20;

    // 用于返回的目标信息结构体（不包含mapping）
    struct GoalInfo {
        uint256 id;
        string title;
        string aiSuggestion;
        string description;
        address creator;
        uint256 amount;
        uint8 status;
        uint256 createdAt;
        uint256 deadline;
        address[] witnesses;
        address[] confirmations;
        uint256 progressPercentage;
        uint256 commentCounter;
        uint256 progressUpdateCounter;
    }

    // 评论结构体
    struct Comment {
        uint256 id;
        string content;
        address creator;
        uint256 createdAt;
    }

    // 进度更新结构体
    struct ProgressUpdate {
        uint256 id;
        string content;
        string proofFileBlobId;
        address creator;
        uint256 createdAt;
    }

    // AI代理结构体
    struct Agent {
        string agentId;
        string agentName;
        string characterJson;
        bool exists;
    }

    // 目标结构体
    struct Goal {
        uint256 id;
        string title;
        string aiSuggestion;
        string description;
        address creator;
        uint256 amount;
        uint8 status;
        uint256 createdAt;
        uint256 deadline;
        address[] witnesses;
        address[] confirmations;
        uint256 commentCounter;
        mapping(uint256 => Comment) comments;
        uint256 progressPercentage;
        uint256 progressUpdateCounter;
        mapping(uint256 => ProgressUpdate) progressUpdates;
    }

    // 状态变量
    mapping(uint256 => Goal) public goals;
    mapping(uint256 => string) public goalToAgent; // 目标ID到代理ID的映射
    mapping(address => uint256[]) public userGoals; // 用户创建的目标
    mapping(address => uint256[]) public witnessGoals; // 见证者相关的目标
    mapping(string => Agent) public agents; // 代理存储

    uint256 public goalCount;
    uint256[] public activeGoals;
    uint256[] public failedGoals;
    uint256[] public completedGoals;

    // 事件
    event GoalCreated(
        uint256 indexed goalId,
        address indexed creator,
        string title,
        address[] witnesses
    );

    event GoalCompleted(
        uint256 indexed goalId,
        address indexed completer
    );

    event WitnessConfirmed(
        uint256 indexed goalId,
        address indexed witness
    );

    event GoalFailed(
        uint256 indexed goalId,
        address indexed failer
    );

    event AgentCreated(
        string agentId,
        string agentName,
        string characterJson
    );

    event AgentUpdated(
        string agentId,
        string characterJson
    );

    event CommentCreated(
        uint256 indexed goalId,
        uint256 commentId,
        address indexed creator,
        string content
    );

    event ProgressUpdated(
        uint256 indexed goalId,
        uint256 updateId,
        address indexed creator,
        string content,
        uint256 progressPercentage,
        string proofFileBlobId
    );

    // 构造函数
    constructor() {
        // 创建AIGToken实例
        aigToken = new AIGToken("AI Goal Token", "AIG", 10**18 * 10**18);
    }

    // 创建新目标
    function createGoal(
        string memory title,
        string memory description,
        string memory aiSuggestion,
        uint256 deadline,
        address[] memory witnesses
    ) external payable {
        require(deadline > block.timestamp, "Invalid deadline");
        require(witnesses.length > 0, "Empty witnesses");
        require(msg.value > 0, "Insufficient payment");

        // 从1开始
        goalCount++;
        uint256 goalId = goalCount;
        Goal storage goal = goals[goalId];

        goal.id = goalId;
        goal.title = title;
        goal.description = description;
        goal.aiSuggestion = aiSuggestion;
        goal.creator = msg.sender;
        goal.amount = msg.value;
        goal.deadline = deadline;
        goal.status = GOAL_STATUS_ACTIVE;
        goal.createdAt = block.timestamp;
        goal.witnesses = witnesses;
        goal.progressPercentage = 0;

        // 更新状态
        activeGoals.push(goalId);
        userGoals[msg.sender].push(goalId);

        // 更新见证者相关目标
        for (uint256 i = 0; i < witnesses.length; i++) {
            witnessGoals[witnesses[i]].push(goalId);
        }

        // 奖励代币给创建者
        aigToken.transfer(msg.sender, AIRDROP_AMOUNT_CREATE_GOAL);

        emit GoalCreated(goalId, msg.sender, title, witnesses);
    }

    // 见证人确认目标
    function confirmWitness(uint256 goalId) external {
        Goal storage goal = goals[goalId];

        bool isWitness = false;
        for (uint256 i = 0; i < goal.witnesses.length; i++) {
            if (goal.witnesses[i] == msg.sender) {
                isWitness = true;
                break;
            }
        }
        require(isWitness, "Not witness");

        // 检查是否已经确认
        for (uint256 i = 0; i < goal.confirmations.length; i++) {
            require(goal.confirmations[i] != msg.sender, "Already confirmed");
        }

        goal.confirmations.push(msg.sender);

        // 奖励代币给见证者
        aigToken.transfer(msg.sender, AIRDROP_AMOUNT_CONFIRM_WITNESS);

        emit WitnessConfirmed(goalId, msg.sender);
    }

    // 完成目标
    function completeGoal(uint256 goalId) external {
        Goal storage goal = goals[goalId];

        require(goal.status == GOAL_STATUS_ACTIVE, "Goal not active");
        require(goal.creator == msg.sender, "Not goal creator");
        require(goal.witnesses.length == goal.confirmations.length, "Not all witnesses confirmed");

        goal.status = GOAL_STATUS_COMPLETED;
        goal.progressPercentage = 100;

        // 从活跃目标中移除
        _removeFromActiveGoals(goalId);
        completedGoals.push(goalId);

        // 返还质押金
        (bool success, ) = payable(msg.sender).call{value: goal.amount}("");
        require(success, "ETH transfer failed");

        // 奖励代币
        aigToken.transfer(msg.sender, AIRDROP_AMOUNT_COMPLETE_GOAL);

        emit GoalCompleted(goalId, msg.sender);
    }

    // 标记目标失败
    function failGoal(uint256 goalId) external {
        Goal storage goal = goals[goalId];

        require(goal.status == GOAL_STATUS_ACTIVE, "Goal not active");
        require(block.timestamp >= goal.deadline, "Deadline not reached");

        // 检查调用者是否是目标相关方
        bool isRelated = false;
        if (goal.creator == msg.sender) isRelated = true;

        for (uint256 i = 0; i < goal.witnesses.length; i++) {
            if (goal.witnesses[i] == msg.sender) {
                isRelated = true;
                break;
            }
        }

        for (uint256 i = 0; i < goal.confirmations.length; i++) {
            if (goal.confirmations[i] == msg.sender) {
                isRelated = true;
                break;
            }
        }

        require(isRelated, "Not goal related member");

        // 检查是否所有见证者都已确认
        require(goal.witnesses.length != goal.confirmations.length, "All witnesses confirmed");

        goal.status = GOAL_STATUS_FAILED;

        // 从活跃目标中移除，添加到失败目标
        _removeFromActiveGoals(goalId);
        failedGoals.push(goalId);

        // 将质押金分给见证者
        uint256 perWitnessAmount = goal.amount / goal.witnesses.length;
        for (uint256 i = 0; i < goal.witnesses.length; i++) {
            (bool success, ) = payable(goal.witnesses[i]).call{value: perWitnessAmount}("");
            require(success, "ETH transfer failed");
        }

        // 奖励代币
        aigToken.transfer(msg.sender, AIRDROP_AMOUNT_FAIL_GOAL);

        emit GoalFailed(goalId, msg.sender);
    }

    // 创建代理
    function createAgent(
        uint256 goalId,
        string memory agentId,
        string memory agentName,
        string memory characterJson
    ) external {
        require(bytes(agentId).length == AGENT_ID_LENGTH, "Agent ID too short");
        require(bytes(agentName).length >= MIN_LENGTH, "Agent name too short");
        require(bytes(characterJson).length >= CHARACTER_JSON_MIN_LENGTH, "Character JSON too short");

        // 检查代理是否已存在
        require(!agents[agentId].exists, "Agent already exists");

        // 检查目标是否已有代理
        require(bytes(goalToAgent[goalId]).length == 0, "Goal already has agent");

        agents[agentId] = Agent({
            agentId: agentId,
            agentName: agentName,
            characterJson: characterJson,
            exists: true
        });

        goalToAgent[goalId] = agentId;

        // 奖励代币给创建者
        aigToken.transfer(msg.sender, AIRDROP_AMOUNT_CREATE_AGENT);

        emit AgentCreated(agentId, agentName, characterJson);
    }

    // 更新代理
    function updateAgent(
        uint256 goalId,
        string memory characterJson
    ) external {
        require(bytes(characterJson).length >= CHARACTER_JSON_MIN_LENGTH, "Character JSON too short");

        string memory agentId = goalToAgent[goalId];
        require(bytes(agentId).length == AGENT_ID_LENGTH, "Agent not exists");

        agents[agentId].characterJson = characterJson;

        // 奖励代币给更新者
        aigToken.transfer(msg.sender, AIRDROP_AMOUNT_UPDATE_AGENT);

        emit AgentUpdated(agentId, characterJson);
    }

    // 创建评论
    function createComment(
        uint256 goalId,
        string memory content
    ) external {
        Goal storage goal = goals[goalId];

        goal.commentCounter++;

        uint256 commentId = goal.commentCounter;
        goal.comments[commentId] = Comment({
            id: commentId,
            content: content,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        // 奖励代币给评论创建者
        aigToken.transfer(msg.sender, AIRDROP_AMOUNT_CREATE_COMMENT);

        emit CommentCreated(goalId, commentId, msg.sender, content);
    }

    // 更新进度
    function updateProgress(
        uint256 goalId,
        string memory content,
        uint256 progressPercentage,
        string memory proofFileBlobId
    ) external {
        Goal storage goal = goals[goalId];

        require(goal.creator == msg.sender, "Not goal creator");
        require(goal.status == GOAL_STATUS_ACTIVE, "Goal not active");
        require(progressPercentage > 0 &&
                progressPercentage >= goal.progressPercentage &&
                progressPercentage <= 100, "Invalid progress percentage");

        goal.progressUpdateCounter++;
        uint256 updateId = goal.progressUpdateCounter;
        goal.progressUpdates[updateId] = ProgressUpdate({
            id: updateId,
            content: content,
            proofFileBlobId: proofFileBlobId,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        goal.progressPercentage = progressPercentage;

        // 奖励代币
        aigToken.transfer(msg.sender, AIRDROP_AMOUNT_UPDATE_PROGRESS);

        emit ProgressUpdated(
            goalId,
            updateId,
            msg.sender,
            content,
            progressPercentage,
            proofFileBlobId
        );
    }

    // 辅助函数：从活跃目标中移除
    function _removeFromActiveGoals(uint256 goalId) internal {
        for (uint256 i = 0; i < activeGoals.length; i++) {
            if (activeGoals[i] == goalId) {
                activeGoals[i] = activeGoals[activeGoals.length - 1];
                activeGoals.pop();
                break;
            }
        }
    }

    // 查看函数
    function getGoal(uint256 goalId) external view returns (GoalInfo memory) {
        Goal storage goal = goals[goalId];
        return GoalInfo({
            id: goal.id,
            title: goal.title,
            aiSuggestion: goal.aiSuggestion,
            description: goal.description,
            creator: goal.creator,
            amount: goal.amount,
            status: goal.status,
            createdAt: goal.createdAt,
            deadline: goal.deadline,
            witnesses: goal.witnesses,
            confirmations: goal.confirmations,
            progressPercentage: goal.progressPercentage,
            commentCounter: goal.commentCounter,
            progressUpdateCounter: goal.progressUpdateCounter
        });
    }

    function getComment(uint256 goalId, uint256 commentId) external view returns (
        uint256 id,
        string memory content,
        address creator,
        uint256 createdAt
    ) {
        Comment storage comment = goals[goalId].comments[commentId];
        return (comment.id, comment.content, comment.creator, comment.createdAt);
    }

    function getProgressUpdate(uint256 goalId, uint256 updateId) external view returns (
        uint256 id,
        string memory content,
        string memory proofFileBlobId,
        address creator,
        uint256 createdAt
    ) {
        ProgressUpdate storage update = goals[goalId].progressUpdates[updateId];
        return (
            update.id,
            update.content,
            update.proofFileBlobId,
            update.creator,
            update.createdAt
        );
    }

    function getActiveGoals() external view returns (uint256[] memory) {
        return activeGoals;
    }

    function getCompletedGoals() external view returns (uint256[] memory) {
        return completedGoals;
    }

    function getFailedGoals() external view returns (uint256[] memory) {
        return failedGoals;
    }

    function getUserGoals(address user) external view returns (uint256[] memory) {
        return userGoals[user];
    }

    function getWitnessGoals(address witness) external view returns (uint256[] memory) {
        return witnessGoals[witness];
    }

    function getAgent(string memory agentId) external view returns (
        string memory,
        string memory,
        string memory,
        bool
    ) {
        Agent storage agent = agents[agentId];
        return (agent.agentId, agent.agentName, agent.characterJson, agent.exists);
    }

    // 代币相关查询函数
    function getTokenAddress() external view returns (address) {
        return address(aigToken);
    }

    function getTokenBalance(address user) external view returns (uint256) {
        return aigToken.balanceOf(user);
    }

    function getTokenInfo() external view returns (
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 totalSupply
    ) {
        return (
            aigToken.name(),
            aigToken.symbol(),
            aigToken.decimals(),
            aigToken.totalSupply()
        );
    }
}

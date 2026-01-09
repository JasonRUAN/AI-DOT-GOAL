import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AIGoalModule = buildModule("AIGoalModule", (m) => {
  const aiGoal = m.contract("AIGoal");

  return { aiGoal };
});

export default AIGoalModule;
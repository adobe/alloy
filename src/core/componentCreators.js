/* eslint-disable import/no-restricted-paths */
import createActivityCollector from "../components/ActivityCollector";
import createContext from "../components/Context";
import createDataCollector from "../components/DataCollector";
import createIdentity from "../components/Identity";
import createLibraryInfo from "../components/LibraryInfo";
import createMachineLearning from "../components/MachineLearning";
import createPersonalization from "../components/Personalization";
import createPrivacy from "../components/Privacy";

export default [
  createActivityCollector,
  createContext,
  createDataCollector,
  createIdentity,
  createLibraryInfo,
  createMachineLearning,
  createPersonalization,
  createPrivacy
];

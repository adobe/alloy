import { uuid } from "../../utils";

const createCorrelation = () => {
  return {
    commands: {
      createCorrelationId: uuid
    }
  };
};

createCorrelation.namespace = "Correlation";

export default createCorrelation;

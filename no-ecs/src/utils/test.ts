export const enableAsserts = () => {
  process.env.NODE_ENV = "development";
};

export const disableAsserts = () => {
  process.env.NODE_ENV = "production";
};

export const simulateProduction = <T extends Function>(callback: T) => {
  enableAsserts();
  callback();
  disableAsserts();
};

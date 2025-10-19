export const enableAsserts = () => {
  import.meta.env.NODE_ENV = "development";
};

export const disableAsserts = () => {
  import.meta.env.NODE_ENV = "production";
};

export const simulateProduction = <T extends Function>(callback: T) => {
  disableAsserts();
  callback();
  enableAsserts();
};

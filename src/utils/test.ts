export const enableAsserts = () => {
  process.env.NODE_ENV = "development";
};

export const disableAsserts = () => {
  process.env.NODE_ENV = "production";
};

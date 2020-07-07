const env = process.env.EDGE_ENV || "int";

const configIds = {
  int: "5c5f7e16-1ed2-41ce-b817-3fa7adb705b5",
  prod: "60928f59-0406-4353-bfe3-22ed633c4f67"
};

export default configIds[env];

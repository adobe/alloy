const env = process.env.EDGE_ENV || "int";

const configIds = {
  int: "f70f48c8-ca4b-4f4b-a4dc-087382148892",
  prod: "60928f59-0406-4353-bfe3-22ed633c4f67"
};

export default configIds[env];

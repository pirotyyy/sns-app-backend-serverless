export const FollowFomatter = (item: any): string => {
  return item.SK.S.slice(10);
};

export const FollowerFormatter = (item: any): string => {
  return item.PK.S.slice(8);
};

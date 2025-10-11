export const RolesEnum = {
  ADMIN: "admin",
  SELLER: "seller",
  BUYER: "buyer",
  SUPPORT: "support",
} as const;

export const UserStatusEnum = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BANNED: "banned",
} as const;

export const ListRoles: RolesEnum[] = [
  RolesEnum.ADMIN,
  RolesEnum.BUYER,
  RolesEnum.SELLER,
  RolesEnum.SUPPORT,
];

export const userStatus: UserStatusEnum[] = [
  UserStatusEnum.ACTIVE,
  UserStatusEnum.INACTIVE,
  UserStatusEnum.BANNED,
];

export type UserStatusEnum =
  (typeof UserStatusEnum)[keyof typeof UserStatusEnum];
export type RolesEnum = (typeof RolesEnum)[keyof typeof RolesEnum];

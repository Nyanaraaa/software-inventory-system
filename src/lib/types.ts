import { ItemType } from "@prisma/client";

type Item = {
  name: string;
  description: string;
  owner: string;
  ownerEmail: string;
  subscriptionDate?: Date;
  purchaseDate?: Date;
  expirationDate: Date;
  itemType: ItemType;
  attachment: string;
};

type ItemUpdate = {
  name?: string;
  description?: string;
  owner?: string;
  ownerEmail?: string;
  subscriptionDate?: Date;
  purchaseDate?: Date;
  itemType?: ItemType;
  expirationDate?: Date;
  attachment?: string;
};

type DisplayedItems = {
  id: number;
  name: string;
  owner: string;
  subscriptionDate?: Date;
  purchaseDate?: Date;
  expirationDate?: Date;
  type: string;
};

export type { Item, ItemUpdate, DisplayedItems };

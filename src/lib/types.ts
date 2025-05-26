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
  licenseKey?: string;
  numberofLicenses?: number;
  requisitionNumber?: string
};

type ItemUpdate = {
  name?: string;
  description?: string;
  owner?: string;
  ownerEmail?: string;
  subscriptionDate?: Date | null; 
  purchaseDate?: Date | null; 
  itemType?: ItemType;
  expirationDate?: Date | null; 
  attachment?: string;
  licenseKey?: string;
  numberOfLicenses?: number;
  requisitionNumber?: string;
};

type DisplayedItems = {
  id: number;
  name: string;
  description: string;
  owner: string;
  ownerEmail?: string; 
  subscriptionDate?: Date | null;
  purchaseDate?: Date | null;
  expirationDate?: Date | null;
  attachment?: string;
  licenseKey?: string;
  licenseKeys?: { key: string; status: string }[]; 
  numberOfLicenses?: number; 
  requisitionNumber?: string; 
  type: string;
  archived: boolean;
};

export type { Item, ItemUpdate, DisplayedItems };

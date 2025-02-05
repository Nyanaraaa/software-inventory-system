type Item = {
  name: string;
  description: string;
  owner: string;
  ownerEmail: string;
  subscriptionDate: Date;
  purchaseDate: Date;
  expirationDate: Date;
  attachment: string;
};

type ItemUpdate = {
  name?: string;
  description?: string;
  owner?: string;
  ownerEmail?: string;
  subscriptionDate?: Date;
  purchaseDate?: Date;
  expirationDate?: Date;
  attachment?: string;
};

export type { Item, ItemUpdate };

interface IGarage {
  id: number;
  name: string;
  location: string;
  pricePerHour: number;
  active: boolean;
  adminID: number;
}

export default IGarage;
interface IParkingSpot {
  id: number;
  name: string;
  reserved: boolean;
  garageID: number;
  active: boolean;
}

export default IParkingSpot;  
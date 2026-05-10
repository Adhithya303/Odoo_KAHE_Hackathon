import { create } from 'zustand';

const useTripStore = create((set) => ({
  activeTrip: null,
  trips: [],
  setActiveTrip: (trip) => set({ activeTrip: trip }),
  setTrips: (trips) => set({ trips }),
  addTrip: (trip) => set((s) => ({ trips: [trip, ...s.trips] })),
  removeTrip: (id) => set((s) => ({ trips: s.trips.filter(t => t.id !== id) })),
}));

export default useTripStore;

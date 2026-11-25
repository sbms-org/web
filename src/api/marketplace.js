import api from './axiosInstance';

function collection(response) {
  const payload = response.data?.data ?? response.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  throw new Error("The ServiceBook API returned an invalid list response.");
}

export async function searchProviders(params) {
  return collection(await api.get('/providers/nearby', { params }));
}

export async function getWorkFeed(params = {}) {
  return collection(await api.get('/work-posts/feed', { params }));
}

export async function getBookings() {
  return collection(await api.get('/bookings'));
}

export async function createBooking(booking) {
  return api.post('/bookings', booking);
}

export async function updateBookingStatus(id, status) {
  return api.patch(`/bookings/${encodeURIComponent(id)}/status`, { status });
}

export async function createIssue(issue) {
  return api.post('/issues', issue);
}

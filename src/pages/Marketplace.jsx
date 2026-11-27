import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/authContext';
import {
  createIssue,
  createBooking,
  getConsentRequests,
  getBookings,
  getWorkFeed,
  searchProviders,
  respondToConsent,
  updateBookingStatus,
} from '../api/marketplace';

const categories = [
  'Home & Technical',
  'Personal & Beauty',
  'Education',
  'Events & Photography',
  'Cleaning',
  'Food & Catering',
  'Health & Fitness',
  'Other',
];

const meetingModes = [
  { value: 'provider_comes', label: 'Provider comes to me' },
  { value: 'client_goes', label: 'I go to the provider' },
  { value: 'third_location', label: 'Meet at a third location' },
];

function getId(value) {
  return value?.id || value?.userId || value?.user_id;
}

function getProviderName(provider) {
  return provider?.name || provider?.displayName || provider?.fullname || provider?.user?.name || provider?.user?.fullname || 'Service provider';
}

function getProviderServices(provider) {
  return Array.isArray(provider?.services) ? provider.services : [];
}

function Loading() {
  return <div className="state-card" role="status">Loading ServiceBook…</div>;
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="state-card state-error" role="alert">
      <strong>We couldn’t load this right now.</strong>
      <span>{message}</span>
      {onRetry && <button className="button button-outline" onClick={onRetry}>Try again</button>}
    </div>
  );
}

function EmptyState({ title, children }) {
  return <div className="state-card"><strong>{title}</strong><span>{children}</span></div>;
}

function ProviderCard({ provider, onBook }) {
  const services = getProviderServices(provider);
  const rating = Number(provider?.rating ?? provider?.averageRating);
  const verified = provider?.verificationStatus === 'VERIFIED'
    || Number(provider?.verificationLevel ?? provider?.verification_level ?? 0) > 0;
  const skills = Array.isArray(provider?.skills) ? provider.skills : [];
  const price = services[0]?.basePrice ?? services[0]?.base_price
    ?? (services[0]?.priceMinor != null ? Number(services[0].priceMinor) / 100 : undefined);

  return (
    <article className="provider-card">
      <div className="provider-avatar" aria-hidden="true">{getProviderName(provider).slice(0, 1).toUpperCase()}</div>
      <div className="provider-content">
        <div className="provider-heading">
          <div>
            <h3>{getProviderName(provider)}</h3>
            <p className="provider-location">{provider?.area || provider?.neighborhood || provider?.city || 'Nearby'}</p>
          </div>
          {verified && <span className="verified-badge">Verified</span>}
        </div>
        <p className="provider-bio">{provider?.bio || 'Local professional ready to help with your service request.'}</p>
        <div className="provider-meta">
          <span>{Number.isFinite(rating) && rating > 0 ? `★ ${rating.toFixed(1)}` : 'New provider'}</span>
          {provider?.distanceKm != null && <span>{Number(provider.distanceKm).toFixed(1)} km away</span>}
          {Number.isFinite(Number(price)) && <span>From {Number(price).toLocaleString()} ETB</span>}
        </div>
        {skills.length > 0 && (
          <div className="tag-row">{skills.slice(0, 4).map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>
        )}
        {services.length > 0 && (
          <div className="service-list">
            {services.slice(0, 2).map((service) => (
              <span className="service-chip" key={getId(service) || service.title}>{service.title}</span>
            ))}
          </div>
        )}
        <div className="provider-actions">
          <button className="button button-dark" onClick={() => onBook(provider)}>Book a service</button>
        </div>
      </div>
    </article>
  );
}

function BookingDialog({ provider, onClose, onCreated }) {
  const services = getProviderServices(provider);
  const [serviceId, setServiceId] = useState(getId(services[0]) || '');
  const [mode, setMode] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationError, setLocationError] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedService = services.find((service) => getId(service) === serviceId);
  const availableModes = selectedService?.meetingModes
    || selectedService?.modesAllowed
    || selectedService?.modes_allowed
    || provider?.meetingModes
    || provider?.modes_supported
    || meetingModes.map((item) => item.value);
  const modes = meetingModes.filter((item) => availableModes.includes(item.value));

  function useMeetingLocation() {
    if (!navigator.geolocation) {
      setLocationError('Location access is not available in this browser.');
      return;
    }
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(String(coords.latitude));
        setLongitude(String(coords.longitude));
      },
      () => setLocationError('Location permission was not granted. Enter coordinates or change browser settings.'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  async function submit(event) {
    event.preventDefault();
    if (!getId(provider) || !serviceId || !mode || !startsAt) {
      toast.error('Choose a service, meeting mode, and time to continue.');
      return;
    }
    if (!latitude || !longitude) {
      toast.error('Add the meeting pin coordinates to continue.');
      return;
    }

    setSaving(true);
    try {
      await createBooking({
        providerId: getId(provider),
        serviceId,
        mode,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(new Date(startsAt).getTime() + Number(selectedService?.durationMinutes || 60) * 60000).toISOString(),
        landmark: landmark.trim() || undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
      });
      toast.success('Booking request sent.');
      onCreated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Your booking could not be sent.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="booking-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <button className="dialog-close" onClick={onClose} aria-label="Close booking dialog">×</button>
        <span className="eyebrow">BOOK A SERVICE</span>
        <h2 id="booking-title">{getProviderName(provider)}</h2>
        <form className="form-stack" onSubmit={submit}>
          <label>
            Service
            <select value={serviceId} onChange={(event) => { setServiceId(event.target.value); setMode(''); }} required>
              <option value="">Choose a service</option>
              {services.map((service) => (
                <option key={getId(service)} value={getId(service)}>{service.title}</option>
              ))}
            </select>
          </label>
          <label>
            Meeting mode
            <select value={mode} onChange={(event) => setMode(event.target.value)} required>
              <option value="">Choose one meeting mode</option>
              {modes.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label>
            Requested date and time
            <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required />
          </label>
          <label>
            Neighborhood or landmark
            <input value={landmark} onChange={(event) => setLandmark(event.target.value)} placeholder="e.g. near the university gate" />
          </label>
          <div className="coordinate-fields">
            <button type="button" className="text-button" onClick={useMeetingLocation}>⌖ Use current location as meeting pin</button>
            <div className="two-fields">
              <label>Latitude<input type="number" step="any" value={latitude} onChange={(event) => setLatitude(event.target.value)} required /></label>
              <label>Longitude<input type="number" step="any" value={longitude} onChange={(event) => setLongitude(event.target.value)} required /></label>
            </div>
          </div>
          {locationError && <p className="inline-error" role="alert">{locationError}</p>}
          <p className="privacy-note">Your exact location is shared with the provider only after the booking is confirmed.</p>
          <button className="button button-dark button-wide" disabled={saving || !services.length}>
            {saving ? 'Sending request…' : 'Request booking'}
          </button>
          {!services.length && <span className="field-note">This provider has no bookable services listed yet.</span>}
        </form>
      </section>
    </div>
  );
}

function DiscoverView({ onBook }) {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [category, setCategory] = useState('');
  const [meetingMode, setMeetingMode] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableToday, setAvailableToday] = useState(false);
  const [minimumRating, setMinimumRating] = useState('');
  const [maximumPrice, setMaximumPrice] = useState('');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationError('Location access is not available in this browser.');
      return;
    }
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ latitude: coords.latitude, longitude: coords.longitude }),
      () => setLocationError('Location permission was not granted. You can try again in browser settings.'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  async function search(event) {
    event?.preventDefault();
    if (!location) {
      setLocationError('Choose your location before searching nearby.');
      return;
    }
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      setProviders(await searchProviders({
        ...location,
        radiusKm: 20,
        ...(category ? { category } : {}),
        ...(meetingMode ? { meetingMode } : {}),
        ...(verifiedOnly ? { verifiedOnly: true } : {}),
        ...(availableToday ? { availableToday: true } : {}),
        ...(minimumRating ? { minimumRating: Number(minimumRating) } : {}),
        ...(maximumPrice ? { maximumPrice: Number(maximumPrice) } : {}),
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'The nearby search service is unavailable.');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">LOCAL SKILLS, ONE SERVICEBOOK</span>
          <h1>Find the right person<br />for the work you need.</h1>
          <p>Discover trusted local professionals, compare their services, and choose where you meet.</p>
          <div className="hero-trust"><span>✓ Verified providers</span><span>✓ Clear booking requests</span><span>✓ Safer meetups</span></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="hero-tile"><span className="hero-tile-icon">✦</span><strong>Good work<br />travels nearby.</strong><small>DISCOVER · BOOK · TRUST</small></div>
        </div>
      </section>

      <section className="search-panel" aria-labelledby="search-title">
        <div className="section-heading">
          <div><span className="eyebrow">DISCOVER TALENT NEAR YOU</span><h2 id="search-title">What do you need help with?</h2></div>
          <button className="button button-outline" type="button" onClick={useMyLocation}>⌖ {location ? 'Location selected' : 'Use my location'}</button>
        </div>
        <form className="search-fields" onSubmit={search}>
          <label className="field-category">Service category
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All categories</option>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>How would you like to meet?
            <select value={meetingMode} onChange={(event) => setMeetingMode(event.target.value)}>
              <option value="">Any meeting mode</option>
              {meetingModes.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
            </select>
          </label>
          <button className="button button-dark search-submit" disabled={loading}>{loading ? 'Searching…' : 'Find providers'}</button>
        </form>
        <div className="search-filters" aria-label="Additional filters">
          <label>Minimum rating
            <select value={minimumRating} onChange={(event) => setMinimumRating(event.target.value)}>
              <option value="">Any rating</option>
              <option value="3">3 stars and up</option>
              <option value="4">4 stars and up</option>
              <option value="4.5">4.5 stars and up</option>
            </select>
          </label>
          <label>Maximum starting price (ETB)
            <input type="number" min="0" step="50" value={maximumPrice} onChange={(event) => setMaximumPrice(event.target.value)} placeholder="Any price" />
          </label>
          <label className="check-filter"><input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} /> Verified only</label>
          <label className="check-filter"><input type="checkbox" checked={availableToday} onChange={(event) => setAvailableToday(event.target.checked)} /> Available today</label>
        </div>
        {locationError && <p className="inline-error" role="alert">{locationError}</p>}
        {location && <p className="field-note">Your location is used for discovery. Exact meeting details stay private until a booking is confirmed.</p>}
      </section>

      <section className="results-section">
        <div className="section-heading">
          <div><span className="eyebrow">SERVICE PROVIDERS</span><h2>{searched ? 'Near your location' : 'Start with your location'}</h2></div>
          {searched && <span className="result-count">{providers.length} {providers.length === 1 ? 'provider' : 'providers'}</span>}
        </div>
        {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={search} /> : !searched ? (
          <EmptyState title="Search nearby to see local talent">Your location is used only for discovery. Exact meeting details stay private until a booking is confirmed.</EmptyState>
        ) : providers.length === 0 ? (
          <EmptyState title="No providers found in this area">Try a different category or meeting mode, or expand your search area.</EmptyState>
        ) : (
          <div className="provider-grid">{providers.map((provider) => <ProviderCard key={getId(provider)} provider={provider} onBook={onBook} />)}</div>
        )}
      </section>
    </>
  );
}

function WorkFeedView({ onBook }) {
  const [refresh, setRefresh] = useState(0);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const key = `${refresh}:${location?.latitude ?? ''}:${location?.longitude ?? ''}`;
  const [result, setResult] = useState({ key: '', posts: [], error: '' });
  const loading = Boolean(location) && result.key !== key;
  const posts = result.key === key ? result.posts : [];
  const error = result.key === key ? result.error : '';

  useEffect(() => {
    if (!location) return undefined;
    let active = true;
    getWorkFeed({ ...location, radiusKm: 20 }).then((items) => {
      if (active) setResult({ key, posts: items, error: '' });
    }).catch((requestError) => {
      if (active) setResult({
        key,
        posts: [],
        error: requestError.response?.data?.message || requestError.message || 'The work feed is unavailable.',
      });
    });
    return () => { active = false; };
  }, [key, location, refresh]);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationError('Location access is not available in this browser.');
      return;
    }
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ latitude: coords.latitude, longitude: coords.longitude }),
      () => setLocationError('Location permission was not granted. Change browser settings and try again.'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <section className="feed-page">
      <div className="page-intro"><span className="eyebrow">MADE BY LOCAL TALENT</span><h1>Work worth discovering.</h1><p>See finished work from nearby providers. Verified-job posts are shared only with client consent.</p>
        <button className="button button-outline feed-location-button" type="button" onClick={useMyLocation}>⌖ {location ? 'Refresh nearby feed' : 'Use my location'}</button>
        {locationError && <p className="inline-error" role="alert">{locationError}</p>}
      </div>
      {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={() => setRefresh((value) => value + 1)} /> : !location ? (
        <EmptyState title="Choose a location to see nearby work">Location is requested only when you choose to load the feed.</EmptyState>
      ) : posts.length === 0 ? (
        <EmptyState title="Your nearby feed is ready for its first post">When providers share work with permission, it will appear here.</EmptyState>
      ) : (
        <div className="feed-grid">
          {posts.map((post) => {
            const media = Array.isArray(post.media) ? post.media : [];
            const cover = post.coverUrl || post.cover_url || media.find((item) => item.isCover || item.is_cover)?.url || media[0]?.url;
            const provider = post.provider?.name || post.provider?.fullname || post.providerName || 'Local provider';
            const providerForBooking = {
              ...(post.provider || {}),
              id: getId(post.provider) || post.providerId || post.provider_id,
              name: provider,
              services: post.provider?.services?.length
                ? post.provider.services
                : post.service ? [post.service] : post.serviceId || post.service_id
                  ? [{ id: post.serviceId || post.service_id, title: post.serviceTitle || post.service_title || 'Service from this post' }]
                  : [],
            };
            return (
              <article className="work-card" key={getId(post)}>
                <div className="work-image">{cover ? <img src={cover} alt={post.caption || 'Provider work sample'} loading="lazy" /> : <div className="image-placeholder">ServiceBook work</div>}</div>
                <div className="work-info">
                  <div className="work-byline"><span className="provider-avatar small">{provider.slice(0, 1).toUpperCase()}</span><div><strong>{provider}</strong><span>{post.area || post.neighborhood || 'Nearby'}</span></div></div>
                  <p>{post.caption || 'A recent work sample from a local provider.'}</p>
                  <div className="work-footer">
                    <span>{post.service?.title || post.serviceTitle || post.type || 'Portfolio'}</span>
                    <button className="text-button" onClick={() => onBook(providerForBooking)}>Book this provider</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function BookingsView() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState({ key: '', items: [], error: '' });
  const [issueBooking, setIssueBooking] = useState(null);
  const [consentRequests, setConsentRequests] = useState([]);
  const [consentError, setConsentError] = useState('');
  const key = `${getId(user) || 'guest'}:${refresh}`;
  const loading = Boolean(user) && result.key !== key;
  const items = result.key === key ? result.items : [];
  const error = result.key === key ? result.error : '';

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    Promise.all([getBookings(), getConsentRequests()]).then(([rows, requests]) => {
      if (active) {
        setResult({ key: `${getId(user) || 'guest'}:${refresh}`, items: rows, error: '' });
        setConsentRequests(requests);
        setConsentError('');
      }
    }).catch((requestError) => {
      if (active) setResult({
        key: `${getId(user) || 'guest'}:${refresh}`,
        items: [],
        error: requestError.response?.data?.message || requestError.message || 'Your bookings could not be loaded.',
      });
      if (active) setConsentError(requestError.response?.data?.message || requestError.message || 'Consent requests could not be loaded.');
    });
    return () => { active = false; };
  }, [user, refresh]);

  async function confirmBooking(id) {
    try {
      await updateBookingStatus(id, 'CONFIRMED');
      toast.success('Booking confirmed.');
      setRefresh((value) => value + 1);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'The booking could not be updated.');
    }
  }

  async function respondToWorkConsent(post, allowed) {
    try {
      await respondToConsent(getId(post), allowed);
      toast.success(allowed ? 'Consent recorded. The post will await moderation.' : 'Consent declined.');
      setRefresh((value) => value + 1);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Your consent response could not be saved.');
    }
  }

  if (!user) {
    return (
      <section className="page-intro bookings-intro">
        <span className="eyebrow">YOUR SERVICEBOOK</span><h1>Keep every booking in reach.</h1>
        <p>Sign in to see requests, meeting details, booking status and your service history.</p>
        <Link className="button button-dark" to="/login">Sign in to view bookings</Link>
      </section>
    );
  }

  return (
    <section className="bookings-page">
      <div className="page-intro"><span className="eyebrow">YOUR SERVICEBOOK</span><h1>Bookings</h1><p>Follow every request from confirmation to completion.</p></div>
      {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={() => setRefresh((value) => value + 1)} /> : items.length === 0 ? (
        <EmptyState title="No bookings yet">Find a provider nearby and send your first booking request.</EmptyState>
      ) : (
        <div className="booking-list">
          {items.map((booking) => {
            const provider = booking.provider?.name || booking.provider?.fullname || booking.providerName || 'Service provider';
            const status = String(booking.status || 'requested').replaceAll('_', ' ');
            const date = booking.startsAt || booking.starts_at || booking.timeRange?.start;
            return (
              <article className="booking-row" key={getId(booking)}>
                <div className="booking-icon">SB</div>
                <div className="booking-summary"><strong>{booking.service?.title || booking.serviceName || booking.serviceTitle || 'Service booking'}</strong><span>{provider} · {booking.mode?.replaceAll('_', ' ') || 'Meeting mode pending'}</span><span>{date ? new Date(date).toLocaleString() : 'Time to be confirmed'}</span></div>
                <span className={`status-pill status-${status.replaceAll(' ', '-')}`}>{status}</span>
                {['individual_provider', 'company_staff'].includes(user.role) && String(booking.status).toLowerCase() === 'requested' && <button className="button button-outline" onClick={() => confirmBooking(getId(booking))}>Confirm</button>}
                <button className="text-button" onClick={() => setIssueBooking(booking)}>Report a problem</button>
              </article>
            );
          })}
        </div>
      )}
      {!loading && !error && user.role === 'client' && consentRequests.length > 0 && (
        <section className="consent-requests" aria-labelledby="consent-requests-heading">
          <div className="section-heading">
            <div><span className="eyebrow">YOUR PERMISSION</span><h2 id="consent-requests-heading">Work-post consent</h2></div>
            <span className="result-count">{consentRequests.length} awaiting your decision</span>
          </div>
          {consentRequests.map((post) => (
            <article className="consent-request" key={getId(post)}>
              {post.media?.[0]?.url && <img src={post.media[0].url} alt="Work proposed for sharing" />}
              <div className="consent-request__copy">
                <strong>{post.providerName || 'Your service provider'}</strong>
                <p>{post.caption || 'A completed service is proposed as a verified work post.'}</p>
                <small>{post.area || 'Area not specified'} · Public work feed</small>
              </div>
              <div className="consent-request__actions">
                <button className="button button-outline" onClick={() => respondToWorkConsent(post, false)}>Decline</button>
                <button className="button button-dark" onClick={() => respondToWorkConsent(post, true)}>Allow sharing</button>
              </div>
            </article>
          ))}
        </section>
      )}
      {consentError && <p className="inline-error" role="alert">{consentError}</p>}
      {issueBooking && <IssueDialog booking={issueBooking} onClose={() => setIssueBooking(null)} onCreated={() => {
        setIssueBooking(null);
        toast.success('Issue sent to the ServiceBook support team.');
      }} />}
    </section>
  );
}

function IssueDialog({ booking, onClose, onCreated }) {
  const [category, setCategory] = useState('service_quality');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (description.trim().length < 10) {
      toast.error('Please describe the issue in at least 10 characters.');
      return;
    }
    setSaving(true);
    try {
      await createIssue({
        bookingId: getId(booking),
        category,
        description: description.trim(),
      });
      onCreated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Your issue could not be submitted.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="booking-dialog" role="dialog" aria-modal="true" aria-labelledby="issue-title">
        <button className="dialog-close" onClick={onClose} aria-label="Close issue form">×</button>
        <span className="eyebrow">SERVICEBOOK SUPPORT</span>
        <h2 id="issue-title">Report a booking issue</h2>
        <form className="form-stack" onSubmit={submit}>
          <label>What happened?
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="late_arrival">Late arrival or no-show</option>
              <option value="service_quality">Service quality</option>
              <option value="damage">Damage or property concern</option>
              <option value="payment">Payment or receipt</option>
              <option value="safety">Safety concern</option>
              <option value="other">Something else</option>
            </select>
          </label>
          <label>Describe the issue
            <textarea rows="5" minLength="10" maxLength="3000" value={description} onChange={(event) => setDescription(event.target.value)} required />
          </label>
          <p className="privacy-note">This report is linked to your booking and can be reviewed by authorized support staff.</p>
          <button className="button button-dark button-wide" disabled={saving}>{saving ? 'Sending…' : 'Send issue report'}</button>
        </form>
      </section>
    </div>
  );
}

export default function Marketplace({ view }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState(null);
  const role = user?.role;
  const heading = useMemo(() => ({
    discover: 'Discover',
    work: 'Work feed',
    bookings: 'Bookings',
  }[view] || 'ServiceBook'), [view]);

  function startBooking(provider) {
    if (!user) {
      toast('Sign in to book a service.');
      navigate('/login');
      return;
    }
    setSelectedProvider(provider);
  }

  useEffect(() => {
    document.title = `${heading} · ServiceBook`;
  }, [heading]);

  return (
    <>
      {view === 'discover' && <DiscoverView onBook={startBooking} />}
      {view === 'work' && <WorkFeedView onBook={startBooking} />}
      {view === 'bookings' && <BookingsView />}
      {role && <div className="signed-in-note">Signed in as <strong>{role.replaceAll('_', ' ')}</strong></div>}
      {selectedProvider && (
        <BookingDialog
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
          onCreated={() => {
            setSelectedProvider(null);
          }}
        />
      )}
    </>
  );
}

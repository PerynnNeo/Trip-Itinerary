'use client';

import { BudgetView } from '@/components/BudgetView';
import { DayView } from '@/components/DayView';
import { EssentialsView } from '@/components/EssentialsView';
import { Header } from '@/components/Header';
import { PackingView } from '@/components/PackingView';
import { PrepView } from '@/components/PrepView';
import { TripOverview } from '@/components/TripOverview';
import { useItinerary } from '@/hooks/useItinerary';
import { useNow } from '@/hooks/useNow';
import { useTripState } from '@/hooks/useTripState';
import { currentTripDay } from '@/lib/dates';
import { accentHex } from '@/lib/itinerary';

export default function Page() {
  const { itinerary, error } = useItinerary();
  const { state, loaded, actions } = useTripState();
  const now = useNow();

  if (error) {
    return (
      <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 8 }}>
            Couldn&apos;t load the itinerary
          </div>
          <p style={{ color: '#6B5E54' }}>{error}</p>
        </div>
      </main>
    );
  }

  // Wait for BOTH the content and the saved state before rendering interactive UI,
  // so a toggle made during the load window can't be lost or overwritten.
  if (!itinerary || !loaded) {
    return (
      <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", color: '#9A8C81', fontSize: 14 }}>Loading your trip…</div>
      </main>
    );
  }

  const accent = accentHex(state.accent);
  const view = state.view;
  const isTrip = view === 'trip';
  const isBudget = view === 'budget';
  const isInfo = view === 'info';
  const isPrep = view === 'prep';
  const isPack = view === 'pack';
  const dayNum = typeof view === 'number' ? view : 0;
  const todayDay = currentTripDay(itinerary.meta.startDate, itinerary.meta.endDate, now);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: '#1A1310', overflowX: 'hidden' }}>
      {/* Decorative floating blobs */}
      <div style={blob('#FFD4E8', { top: -80, left: -60, width: 300, height: 300 }, '9s')} />
      <div style={blob('#CFE8FF', { bottom: -100, right: -40, width: 340, height: 340 }, '11s')} />
      <div style={blob('#FFF0C2', { top: '40%', right: '8%', width: 200, height: 200 }, '13s')} />

      <Header
        itinerary={itinerary}
        view={view}
        accent={accent}
        accentName={state.accent}
        showKorean={state.showKorean}
        todayDay={todayDay}
        onView={actions.setView}
        onAccent={actions.setAccent}
        onShowKorean={actions.setShowKorean}
        onReset={actions.resetProgress}
      />

      <main className="app-main" style={{ position: 'relative', zIndex: 1, maxWidth: 1080, margin: '0 auto' }}>
        {isTrip && (
          <TripOverview
            itinerary={itinerary}
            state={state}
            accent={accent}
            onView={actions.setView}
          />
        )}

        {isPrep && (
          <PrepView
            itinerary={itinerary}
            state={state}
            accent={accent}
            onToggleTodo={actions.toggleTodo}
          />
        )}

        {isPack && (
          <PackingView
            state={state}
            accent={accent}
            onToggleTodo={actions.toggleTodo}
          />
        )}

        {!isTrip && !isBudget && !isInfo && !isPrep && !isPack && dayNum >= 1 && dayNum <= itinerary.days.length && (
          <DayView
            itinerary={itinerary}
            dayNum={dayNum}
            state={state}
            accent={accent}
            now={now}
            isToday={todayDay === dayNum}
            onView={actions.setView}
            onToggleExpand={actions.toggleExpand}
            onToggleCheck={actions.toggleCheck}
            onSetActual={actions.setActual}
          />
        )}

        {isBudget && (
          <BudgetView
            itinerary={itinerary}
            currency={state.currency}
            perPerson={state.perPerson}
            accent={accent}
            actuals={state.actuals}
            onCurrency={actions.setCurrency}
            onPerPerson={actions.setPerPerson}
          />
        )}

        {isInfo && <EssentialsView accent={accent} />}
      </main>
    </div>
  );
}

function blob(
  color: string,
  pos: React.CSSProperties,
  speed: string,
): React.CSSProperties {
  return {
    position: 'fixed',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${color}, transparent 70%)`,
    filter: 'blur(20px)',
    zIndex: 0,
    pointerEvents: 'none',
    animation: `floaty ${speed} ease-in-out infinite`,
    ...pos,
  };
}

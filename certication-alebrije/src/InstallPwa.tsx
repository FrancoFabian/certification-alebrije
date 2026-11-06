import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function isAppleMobile() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function InstallPwa() {
  const [installed, setInstalled] = useState(isStandalone)
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as InstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setPromptEvent(null)
      setShowHelp(false)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function install() {
    if (!promptEvent) {
      setShowHelp(value => !value)
      return
    }
    try {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      setPromptEvent(null)
      if (choice.outcome !== 'accepted') setShowHelp(true)
    } catch {
      setShowHelp(true)
    }
  }

  if (installed) return null

  return <section className="install-pwa" aria-label="Instalar aplicación">
    <div className="install-pwa-copy">
      <strong>Úsala como una app.</strong>
      <p>Ábrela desde la pantalla de inicio de tu celular.</p>
    </div>
    <button type="button" onClick={() => void install()} aria-expanded={showHelp}>
      {promptEvent ? 'Instalar aplicación' : 'Cómo instalar'}
    </button>
    {showHelp && <div className="install-pwa-help" role="status">
      {isAppleMobile()
        ? 'En Safari, toca Compartir y elige «Añadir a la pantalla de inicio».'
        : 'En Chrome, abre el menú ⋮ y selecciona «Instalar aplicación» o «Añadir a pantalla principal».'}
      <small>Abre la versión HTTPS de producción para instalarla. Durante el desarrollo con Vite puede no aparecer la opción.</small>
    </div>}
  </section>
}

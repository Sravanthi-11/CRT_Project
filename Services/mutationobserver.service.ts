import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MutationObserverService {
  private mutationObserver: MutationObserver;
  private renderer: Renderer2;

  // List of links you want to track as prefixes
  private linksToTrack: string[] = [
    'https://providence.org/lp/seminar',
    'https://www.providence.org/forms/seminar?seminar'
  ];

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  public initializeMutationObserver(targetNode: HTMLElement | null = null): void {
    // If targetNode is null or undefined, default to document.body
    const target = targetNode || document.body;

    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.checkAndUpdateLinks();
        }
      });
    });

    const config = { childList: true, subtree: true };

    // Observe the target (either provided or default to document.body)
    this.mutationObserver.observe(target, config);

    this.checkAndUpdateLinks();  // Initial check for existing links
  }


  // Check and apply listeners only to the tracked links (prefix-based matching)
  private checkAndUpdateLinks(): void {
    const anchorElements = document.querySelectorAll('a[href]');
    Array.from(anchorElements).forEach(anchorElement => {
      if (anchorElement instanceof HTMLAnchorElement) {
        const href = anchorElement.getAttribute('href');

        // Apply only if href starts with any URL in linksToTrack (prefix match)
        if (this.isTrackedLink(href)) {
          // Only add listeners if not already added (using data-tracked attribute)
          if (!anchorElement.hasAttribute('data-tracked')) {
            this.addLinkEventListeners(anchorElement);
            anchorElement.setAttribute('data-tracked', 'true'); // Mark as tracked
          }
        }
      }
    });

    this.addGlobalFunction();
  }

  // Helper function to check if the href starts with one of the tracked links
  private isTrackedLink(href: string | null): boolean {
    return href !== null && this.linksToTrack.some(trackedLink => href.startsWith(trackedLink));
  }

  // Add all necessary event listeners (click, mousedown, auxclick)
  private addLinkEventListeners(anchorElement: HTMLAnchorElement): void {
    // Left-click and Shift+click handling
    this.renderer.listen(anchorElement, 'click', (event) => this.handleLinkClick(event, anchorElement));

    // Right-click handling (mousedown for context menu)
    this.renderer.listen(anchorElement, 'mousedown', (event) => this.handleRightClick(event, anchorElement));

    // Middle-click handling (auxclick for middle mouse button)
    this.renderer.listen(anchorElement, 'auxclick', (event) => this.handleMiddleClick(event, anchorElement));
  }

  // Handle left-click and Shift+click events
  private handleLinkClick(event: MouseEvent, anchorElement: HTMLAnchorElement): void {
    if (event.button === 0) { // Left-click
      if (event.shiftKey) {
        // Shift+Click (open in a new window)
        this.modifyHrefForTracking(anchorElement);
        window.open(anchorElement.href, '_blank');
        event.preventDefault();
      } else {
        this.modifyHrefForTracking(anchorElement);
      }
    }
  }

  // Handle right-click (context menu)
  private handleRightClick(event: MouseEvent, anchorElement: HTMLAnchorElement): void {
    if (event.button === 2) { // Right-click
      this.modifyHrefForTracking(anchorElement);
      // Allow context menu, so no preventDefault()
    }
  }

  // Handle middle-click (open in a new tab)
  private handleMiddleClick(event: MouseEvent, anchorElement: HTMLAnchorElement): void {
    if (event.button === 1) { // Middle-click
      this.modifyHrefForTracking(anchorElement);
      // Prevent default to avoid duplicate tabs
      event.preventDefault();
      window.open(anchorElement.href, '_blank');
    }
  }

  // Modify the link's href to include tracking parameters
  private modifyHrefForTracking(anchorElement: HTMLAnchorElement): void {
    const id = (window as any).dexAna.whReturnPCID();
    const decorationString = (window as any).whCrossV4("pcid", id);
    const href = anchorElement.getAttribute('href');

    if (href) {
      anchorElement.href = (window as any).whUpdateQueryStringParameter(href, "_pcid", decorationString);
    }
  }

  // Add a global function for tracking (if needed elsewhere in the window scope)
  private addGlobalFunction(): void {
    (window as any).executeCustomFunctions = (eventAction: MouseEvent) => {
      const link = (eventAction.target as HTMLElement).closest('a');
      if (link instanceof HTMLAnchorElement) {
        const href = link.getAttribute('href');
        if (href && this.isTrackedLink(href)) {
          this.modifyHrefForTracking(link);
        }
      }
    };
  }

  // Method to disconnect the MutationObserver
  public disconnectMutationObserver(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      console.log('MutationObserver has been disconnected.');
    }
  }
}

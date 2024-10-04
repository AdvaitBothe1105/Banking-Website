const observerCallback = (entries, animationClass) => {
    entries.forEach(entry => {
      const target = entry.target.querySelector(`.${entry.target.dataset.animTarget}`);
      if (entry.isIntersecting) {
        target.classList.add(animationClass);
      } else {
        target.classList.remove(animationClass);
      }
    });
  };
  
  // Create a single observer instance
  const createObserver = (wrapperSelector, animationClass) => {
    const observer = new IntersectionObserver(entries => {
      observerCallback(entries, animationClass);
    });
    observer.observe(document.querySelector(wrapperSelector));
  };
  
  // Apply the observers to all relevant sections
  createObserver('.img-wrap', 'slide-in-left');         // For image section
  createObserver('.txt-wrapper', 'slide-in-bottom');    // For text section
  createObserver('.features-section', 'slide-in-blurred-top'); // For features section
  createObserver('.sing-wrap', 'bounce-in-top');        // For single feature section
  createObserver('.app-wrap', 'scale-in-center');       // For app section
  
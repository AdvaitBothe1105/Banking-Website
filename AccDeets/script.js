
// Function to check if the element is in the viewport
// function isInViewport(element) {
//     const rect = element.getBoundingClientRect();
//     return (
//         rect.top >= 0 &&
//         rect.left >= 0 &&
//         rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
//         rect.right <= (window.innerWidth || document.documentElement.clientWidth)
//     );
// }

// // Get the image element
// const img = document.getElementById('animated-img');

// // Add scroll event listener to the window
// window.addEventListener('scroll', function() {
//     if (isInViewport(img)) {
//         // Add the animation class when the image is in the viewport
//         img.classList.add('slide-in-left');
//     }
// });

// document.addEventListener("DOMContentLoaded", () => {
//     // Get the target section you want to observe (features section)
//     const targetElement = document.querySelector(".features-section"); // Make sure this class exists in your HTML
  
//     if (!targetElement) {
//       console.error("Target element not found");
//       return;
//     }
  
//     // Set up the IntersectionObserver
//     const observer = new IntersectionObserver((entries, observer) => {
//       entries.forEach(entry => {
//         // When the section is in the viewport, add the class
//         if (entry.isIntersecting) {
//           entry.target.classList.add("slide-in-bottom");
//           observer.unobserve(entry.target); // Stop observing after animation is added
//         }
//       });
//     }, {
//       root: null, // Use the viewport as root
//       threshold: 0.2 // Trigger when 20% of the element is in view
//     });
  
//     // Start observing the target element
//     observer.observe(targetElement);
//   });
  

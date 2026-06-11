(function () {
	const animateLines = (lines, delay = 0) => {
		lines.forEach((line, i) => {
			line.classList.add("animated");
			Array.from(line.children).forEach((element) => {
				element.style.animationDelay = `${delay + i * 0.25}s`;
				setTimeout(() => {
					line.style.overflow = "visible";
				}, delay * 1000 + i * 250 + 600);
			});
		});
	};

	const headingAnimation = (section) => {
		if (!section || !section.classList.contains("slideshow-section")) return;

		const wrapper = section.querySelector(".slideshow-slide__content");
		if (!wrapper || !wrapper.getAttribute("data-text-animation")) return;

		const texts = section.querySelectorAll(
			".testimonials__content-text--animation",
		);
		let splitInstances = [];

		const splitHeadings = () => {
			const headings = section.querySelectorAll(".js-split-text");
			if (headings.length === 0) return;
			if (splitInstances.length > 0) {
				splitInstances.forEach((instance) => {
					requestAnimationFrame(() => {
						instance.split({ types: "lines, words" });
					});
				});
			} else {
				headings.forEach((heading) => {
					const split = new SplitType(heading, { types: "lines, words" });
					splitInstances.push(split);
					heading.classList.add("visible");
				});
			}
		};

		if (window.SplitType?.clearData) {
			window.SplitType.clearData();
		}

		const textObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					//
					// Изменяем условие: не только когда полностью видим (threshold: 1)
					const lines = entry.target.querySelectorAll(".js-split-text .line");
					const autoplayEnabled =
						section.querySelector(".js-content-slider").dataset.autoplay;
					const slider = section.querySelector(".js-content-slider").swiper;

					if (entry.isIntersecting || entry.intersectionRatio > 0.1) {
						// Добавляем условие
						const speed = 0.8;
						animateLines(lines, speed);
						if (autoplayEnabled === "true" && slider?.autoplay?.running) {
							section
								.querySelector(".swiper-slide-active .circle ")
								.classList.add("run");
						}
					} else {
						lines.forEach((line) => {
							line.classList.remove("animated");
							line.style.overflow = "hidden";
						});
					}
				});
			},
			{
				threshold: [0.1, 0.5, 1], // Множественные пороги
				rootMargin: "50px 0px", // Добавляем margin для раннего срабатывания
			},
		);

		const resizeObserver = new ResizeObserver(() => {
			splitHeadings();
			texts.forEach((text) => textObserver.observe(text));
		});

		splitHeadings();
		texts.forEach((text) => {
			textObserver.observe(text);
			resizeObserver.observe(text);
		});
	};

	const resetLines = (lines) => {
		lines.forEach((line) => {
			line.classList.remove("animated");
			line.style.overflow = "hidden";

			Array.from(line.children).forEach((el) => {
				el.style.animation = "none";
				el.offsetHeight;
				el.style.animation = "";
				el.style.opacity = "0";
				el.style.transform = "translate3d(0, 100%, 0)";
			});
		});
	};

	const slideshow = () => {
		$(".slideshow-section").each(function () {
			if ($(this).hasClass("slider_started")) {
				return "";
			}
			headingAnimation($(this)[0]);
			$(this).addClass("slider_started");
			const id = $(this).attr("id");
			const box = $(this).find(".slideshow");
			const autoplay = box.data("autoplay");
			const isPrereview = box.data("is-prereview");
			const isLoop = box.data("loop");
			const stopAutoplay = box.data("stop-autoplay");
			const delay = box.data("delay") * 1000;
			const slideCount = box.data("slide-count");
			const speed = box.data("speed") * 1000;

			document.documentElement.style.setProperty(
				"--bullet-duration",
				`${delay + speed}ms`,
			);

			let autoplayParam;
			if (autoplay && slideCount > 1) {
				autoplayParam = {
					autoplay: {
						delay: delay,
						pauseOnMouseEnter: stopAutoplay,
						disableOnInteraction: false,
					},
				};
			} else {
				autoplayParam = {
					autoplay: false,
				};
			}

			const preriewParams = isPrereview
				? {
						//slidesPerView: 1.2,
						//centeredSlides: true,
				  }
				: {};

			const commonParams = {
				speed,
				effect: box.data("effect"),
				loop: isLoop && slideCount > 1,
				autoHeight: false,
				calculateHeight: false,
				keyboard: true,
				mousewheel: {
					forceToAxis: true,
				},
				...autoplayParam,
			};

			const swiperOverlayParams = {
				parallax: box.data("parallax"),
				centeredSlides: false,
				...preriewParams,
				spaceBetween: 0,
				navigation: {
					nextEl: `#${id} .swiper-button-next`,
					prevEl: `#${id} .swiper-button-prev`,
				},
				pagination: {
					el: `#${id} .swiper-pagination`,
					clickable: true,
				},
				breakpoints: {
					1100: {
						spaceBetween: 32,
					},
				},
				on: {
					init: function () {
						const activeSlide = this.slides[this.activeIndex];
						const lines = activeSlide.querySelectorAll(".js-split-text .line");

						if (!lines.length) return;

						resetLines(lines);

						requestAnimationFrame(() => {
							animateLines(lines, 0.8);
						});
					},
				},
			};

			const changeColorScheme = (context) => {
				const activeIndex = context.activeIndex;
				const activeSlide = context.slides[activeIndex];
				const changeItems = [
					context.navigation.nextEl,
					context.navigation.prevEl,
					context.pagination.el,
				];

				const colorScheme = activeSlide?.dataset?.colorScheme;

				changeItems.forEach((item) => {
					if (item) {
						let classNames = item.getAttribute("class");
						classNames = classNames.replace(/color-background-\d+/g, "");
						item.setAttribute("class", classNames);
						item.classList.add(colorScheme);
					}
				});
			};

			const sliderEl = document.querySelector(`#${id} .slideshow__swiper`);

			const swiperOverlay = new Swiper(sliderEl, {
				...commonParams,
				...swiperOverlayParams,
			});

			if (isPrereview) {
				document.addEventListener("focusin", (e) => {
					if (
						e.target.closest(".slideshow__swiper.swiper.swiper-initialized")
					) {
						const slide = e.target.closest(".swiper-slide");
						if (!slide) return;
						const index = [...swiperOverlay.slides].indexOf(slide);
						if (swiperOverlay.activeIndex !== index) {
							swiperOverlay.slideTo(index, 0);
						}
					}
				});
			}

			changeColorScheme(swiperOverlay);
			swiperOverlay.on("beforeTransitionStart", function () {
				changeColorScheme(this);
			});

			swiperOverlay.on("slideChange", function () {
				setTimeout(() => {
					document
						.querySelectorAll(
							".swiper-slide:not(.swiper-slide-active) .staggered-line-reveal__word",
						)
						.forEach((el) => el.classList.remove("show"));
				}, 900);

				const activeIndex = this.activeIndex;
				const activeSlide = this.slides[activeIndex];
				initButtonsAnimation(activeSlide);
			});

			swiperOverlay.on("slideChange", function () {
				const activeSlide = this.slides[this.activeIndex];
				const lines = activeSlide.querySelectorAll(".js-split-text .line");

				if (!lines.length) return;

				resetLines(lines);

				requestAnimationFrame(() => {
					animateLines(lines, 0.8);
				});
			});
		});
	};

	document.addEventListener("DOMContentLoaded", function () {
		slideshow();
		document.addEventListener("shopify:section:load", function () {
			slideshow();
		});
	});
})();

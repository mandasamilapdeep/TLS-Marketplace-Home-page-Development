(() => {
	const blob = document.getElementById("tabs-lava-lamp-blob");
	const track = document.querySelector(".tabs-lava-lamp");
	const navItems = document.querySelectorAll(".tabs-lava-lamp li");
	let activeItem = document.querySelector(".tabs-lava-lamp .active");
	let isScrolling = false;
	let scrollTimeout = null;

	if (!blob || !track || navItems.length === 0) return;

	const getScrollOffset = () => {
		const root = document.documentElement;
		const headerHeight =
			Number.parseInt(
				getComputedStyle(root).getPropertyValue("--header-height")
			) || 0;
		const breadcrumbsHeight =
			Number.parseInt(
				getComputedStyle(root).getPropertyValue("--breadcrumbs-height")
			) || 0;
		return headerHeight + breadcrumbsHeight;
	};

	const scrollToElement = (element) => {
		if (!element) return;
		const offset = getScrollOffset();
		const elementPosition =
			element.getBoundingClientRect().top + window.pageYOffset;
		const offsetPosition = elementPosition - offset;

		isScrolling = true;
		if (scrollTimeout) clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(() => {
			isScrolling = false;
		}, 1000);

		window.scrollTo({
			top: offsetPosition,
			behavior: "smooth",
		});
	};

	// ====== Blob ======
	const makeBlob = () => {
		blob.style.width = `${activeItem?.clientWidth}px`;
		blob.style.height = `${activeItem?.clientHeight}px`;
		blob.style.left = `${activeItem?.offsetLeft}px`;
		blob.style.top = `${activeItem?.offsetTop}px`;
		blob.classList.add("blob-initialized");
	};

	const animate = (to) => {
		navItems.forEach((item) => item.classList.remove("active-hover"));
		blob.animate(
			[
				{ left: `${blob.offsetLeft}px`, width: `${blob.clientWidth}px` },
				{ left: `${to.offsetLeft}px`, width: `${to.clientWidth}px` },
			],
			{
				duration: 300,
				easing: "cubic-bezier(0.87,0,0.13,1)",
				fill: "forwards",
			}
		);
		to.classList.add("active-hover");
	};

	const scrollIntoView = (element) => {
		const container =
			element.closest(".product__info-navigations--container") ||
			element.closest(".popular-products__collection-tabs-list--wrapper");
		if (!container || !element) return;

		const containerRect = container.getBoundingClientRect();
		const elementRect = element.getBoundingClientRect();

		if (elementRect.left < containerRect.left) {
			const scrollAmount = elementRect.left - containerRect.left;
			const newScrollLeft = container.scrollLeft + scrollAmount;

			if (newScrollLeft < 50) {
				container.scrollTo({
					left: 0,
					behavior: "smooth",
				});
			} else {
				container.scrollBy({
					left: scrollAmount,
					behavior: "smooth",
				});
			}
		} else if (elementRect.right > containerRect.right) {
			const scrollAmount = elementRect.right - containerRect.right;
			const newScrollLeft = container.scrollLeft + scrollAmount;
			const maxScrollLeft = container.scrollWidth - container.clientWidth;

			if (maxScrollLeft - newScrollLeft < 50) {
				container.scrollTo({
					left: maxScrollLeft,
					behavior: "smooth",
				});
			} else {
				container.scrollBy({
					left: scrollAmount,
					behavior: "smooth",
				});
			}
		}
	};

	const setActive = (li) => {
		if (!li || li.id === "tabs-lava-lamp-blob") return;
		navItems.forEach((item) => item.classList.remove("active"));
		li.classList.add("active");
		activeItem = li;
		animate(li);
		scrollIntoView(li);
	};

	const observeHorizontalScroll = (className = "") => {
		const el = document.querySelector(className);
		if (!el) return;

		const checkScrollState = () => {
			const scrollLeft = el.scrollLeft;
			const maxScrollLeft = el.scrollWidth - el.clientWidth;

			const hasScroll = el.scrollWidth > el.clientWidth;
			const atStart = scrollLeft <= 1;
			const atEnd = scrollLeft >= maxScrollLeft - 2;

			if (hasScroll && !atStart) {
				el.classList.add("left-shadow");
			} else {
				el.classList.remove("left-shadow");
			}

			if (hasScroll && !atEnd) {
				el.classList.add("right-shadow");
			} else {
				el.classList.remove("right-shadow");
			}
		};

		el.addEventListener("scroll", checkScrollState);

		const ro = new ResizeObserver(() => {
			checkScrollState();
		});

		ro.observe(el);

		checkScrollState();
	};

	const init = () => {
		observeHorizontalScroll(".product__info-navigations--container");
		observeHorizontalScroll(".popular-products__collection-tabs-list--wrapper");

		makeBlob();

		track.addEventListener("click", (e) => {
			const li = e.target.closest("li");
			if (!li || li.id === "tabs-lava-lamp-blob") return;

			const link = li.querySelector("a");
			const targetId = link?.getAttribute("href")?.replace("#", "");

			e.preventDefault();

			if (targetId === "all-features") {
				const firstAllFeaturesSectionId = Object.keys(sectionToTabMap).find(
					(key) => sectionToTabMap[key] === "all-features"
				);

				const targetSection = document.getElementById(
					firstAllFeaturesSectionId
				);
				scrollToElement(targetSection);
			} else {
				const targetSection = document.getElementById(targetId);
				scrollToElement(targetSection);
			}

			setActive(li);
		});

		if (window.innerWidth > 767) {
			track.addEventListener("mouseover", (e) => {
				const li = e.target.closest("li");
				if (!li || li.id === "tabs-lava-lamp-blob") return;
				animate(li);
			});
			track.addEventListener("mouseout", () => {
				navItems.forEach((item) => item.classList.remove("active-hover"));
				animate(activeItem);
			});
		}

		const sectionToTabMap = {
			description: "description", // About product
			specs_long: "specs_long", // Specs
			instructions: "instructions",
			"media-section": "all-features",
			"description-grid-section": "all-features",
			"image-with-text-section": "all-features",
			"testimonials-quote": "testimonials-quote", // Reviews
		};

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !isScrolling) {
						const tabId = sectionToTabMap[entry.target.id];
						if (!tabId) return;

						const li = document
							.querySelector(`.tabs-lava-lamp a[href="#${tabId}"]`)
							?.closest("li");

						if (li) setActive(li);
					}
				});
			},
			{ rootMargin: "0px 0px 0px 0px", threshold: 0.8 }
		);

		Object.keys(sectionToTabMap).forEach((id) => {
			const section = document.getElementById(id);
			if (section) observer.observe(section);
		});
	};

	document.addEventListener("DOMContentLoaded", init);
})();

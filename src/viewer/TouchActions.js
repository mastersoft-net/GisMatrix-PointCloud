import { Env } from "./Env.js";

export class TouchActions {

	constructor(options) {
		this.options = options;
		this.fingerCount_ = 0;
		this.startX_ = 0;
		this.startY_ = 0;
		this.curX_ = 0;
		this.curY_ = 0;
		this.minLength_ = 72;
		this.swipeLength_ = 0;
		this.swipeAngle_ = null;
		this.swipeDirection_ = null;
		this.excludedElements_ = "label, button, input, select, textarea, a, .noSwipe";
		this.pressTimerHandle_ = null;
		this.pressThreshold_ = 5;
		this.tapedTwice_ = false;
		this.onPressTrigered_ = false;
		const pl = Env.useCapture;
		this.touchStartEvent_ = (event) => {
			this.touchStart_(event);
		};
		this.touchEndEvent_ = (event) => {
			this.touchEnd_(event);
		};
		this.touchCancelEvent_ = () => {
			this.touchCancel_();
		};
		this.touchMoveEvent_ = (event) => {
			this.touchMove_(event);
		};
		options.element.addEventListener("touchstart", this.touchStartEvent_, pl);
		options.element.addEventListener("touchend", this.touchEndEvent_, pl);
		options.element.addEventListener("touchcancel", this.touchCancelEvent_, pl);
		options.element.addEventListener("touchmove", this.touchMoveEvent_, pl);
	}

	touchStart_(event) {
		if (this.options.onEventStart) {
			this.options.onEventStart(event);
		}
		this.clearPressInterval_(event);
		if (this.closest_(event.target, this.excludedElements_).length > 0) {
			return;
		}
		if (this.isDoubleTap_(event) === true) {
			return;
		}
		this.fingerCount_ = event.touches.length;
		if (this.fingerCount_ === 1) {
			this.startX_ = event.touches[0].pageX;
			this.startY_ = event.touches[0].pageY;
			const x = this.startX_ - this.options.element.offsetLeft;
			const y = this.startY_ - this.options.element.offsetTop;
			if (this.options.onTouch) {
				this.options.onTouch(event, [x, y]);
			}
			this.onPressTrigered_ = false;
			this.pressTimerHandle_ = window.setTimeout(() => {
				this.onPressTrigered_ = true;
				if (this.options.onPress) {
					this.options.onPress(event, [x, y]);
				}
			}, 300);
		}
		else {
			this.touchCancel_();
		}
	}
	closest_(ele, selector) {
		const parents = [];
		let selArray = [];
		if (typeof selector === "string") {
			if (selector.indexOf(",") !== -1) {
				selArray = selector.split(",");
			}
			else {
				selArray = [selector];
			}
		}
		else {
			selArray = selector;
		}
		for (let i = 0, ii = selArray.length; i < ii; ++i) {
			let el = ele;
			const tag = selArray[i].toUpperCase().trim();
			do {
				if (el.nodeName.trim() === tag) {
					parents.push(el);
					break;
				}
			} while (el = el.parentNode);
		}
		return parents;
	}
	isDoubleTap_(event) {
		if (!this.tapedTwice_) {
			this.tapedTwice_ = true;
			setTimeout(() => {
				this.tapedTwice_ = false;
			}, 300);
			return false;
		}
		if (this.options.onDoubleTap) {
			this.options.onDoubleTap(event);
		}
		return true;
	}
	clearPressInterval_(event) {
		if (this.onPressTrigered_ === false && this.pressTimerHandle_ !== null) {
			this.onPressTrigered_ = false;
			if (this.options.onPressCancel) {
				this.options.onPressCancel(event);
			}
		}
		window.clearTimeout(this.pressTimerHandle_);
		this.pressTimerHandle_ = null;
	}
	touchMove_(event) {
		if (event.touches.length === 1) {
			this.curX_ = event.touches[0].pageX;
			this.curY_ = event.touches[0].pageY;
			if (Math.sqrt(Math.pow(this.curX_ - this.startX_, 2) + Math.pow(this.curY_ - this.startY_, 2)) > this.pressThreshold_) {
				this.clearPressInterval_(event);
			}
		}
		else {
			this.touchCancel_();
		}
	}
	touchEnd_(event) {
		this.clearPressInterval_(event);
		if (this.fingerCount_ === 1 && this.curX_ !== 0) {
			this.swipeLength_ = Math.round(Math.sqrt(Math.pow(this.curX_ - this.startX_, 2) + Math.pow(this.curY_ - this.startY_, 2)));
			if (this.swipeLength_ >= this.minLength_) {
				this.caluculateAngle_();
				this.determineSwipeDirection_();
				this.processingRoutine_(event);
				this.touchCancel_();
			}
			else {
				this.touchCancel_();
			}
		}
		else {
			this.touchCancel_();
		}
	}
	touchCancel_() {
		this.fingerCount_ = 0;
		this.startX_ = 0;
		this.startY_ = 0;
		this.curX_ = 0;
		this.curY_ = 0;
		this.swipeLength_ = 0;
		this.swipeAngle_ = null;
		this.swipeDirection_ = null;
		this.clearPressInterval_(null);
	}
	caluculateAngle_() {
		const X = this.startX_ - this.curX_;
		const Y = this.curY_ - this.startY_;
		const r = Math.atan2(Y, X);
		this.swipeAngle_ = Math.round(r * 180 / Math.PI);
		if (this.swipeAngle_ < 0) {
			this.swipeAngle_ = 360 - Math.abs(this.swipeAngle_);
		}
	}
	determineSwipeDirection_() {
		if ((this.swipeAngle_ <= 45) && (this.swipeAngle_ >= 0)) {
			this.swipeDirection_ = 1;
		}
		else if ((this.swipeAngle_ <= 360) && (this.swipeAngle_ >= 315)) {
			this.swipeDirection_ = 1;
		}
		else if ((this.swipeAngle_ >= 135) && (this.swipeAngle_ <= 225)) {
			this.swipeDirection_ = 2;
		}
		else if ((this.swipeAngle_ > 45) && (this.swipeAngle_ < 135)) {
			this.swipeDirection_ = 3;
		}
		else {
			this.swipeDirection_ = 4;
		}
	}
	processingRoutine_(event) {
		if (this.options.onSwipe) {
			this.options.onSwipe(event);
		}
		if (this.swipeDirection_ === 1) {
			if (this.options.onSwipeLeft) {
				this.options.onSwipeLeft(event);
			}
		}
		else if (this.swipeDirection_ === 2) {
			if (this.options.onSwipeRight) {
				this.options.onSwipeRight(event);
			}
		}
		else if (this.swipeDirection_ === 4) {
			if (this.options.onSwipeUp) {
				this.options.onSwipeUp(event);
			}
		}
		else if (this.swipeDirection_ === 3) {
			if (this.options.onSwipeDown) {
				this.options.onSwipeDown(event);
			}
		}
	}
	dispose() {
		const element = this.options.element;
		if (element) {
			const pl = Env.useCapture;
			element.removeEventListener("touchstart", this.touchStartEvent_, pl);
			element.removeEventListener("touchend", this.touchEndEvent_, pl);
			element.removeEventListener("touchcancel", this.touchCancelEvent_, pl);
			element.removeEventListener("touchmove", this.touchMoveEvent_, pl);
		}
		this.touchStartEvent_ = null;
		this.touchEndEvent_ = null;
		this.touchCancelEvent_ = null;
		this.touchMoveEvent_ = null;
	}
}

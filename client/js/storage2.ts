class Storage {
	isAvailable() {
		return this.hasLocalStorage()
	}


	load(): any {
		const data = window.localStorage.data
		try {
			return JSON.parse(data)
		}
		catch (err) {
			return null
		}
	}


	save(data: any) {
		window.localStorage.setItem('data', JSON.stringify(data))
	}


	clear() {
		window.localStorage.removeItem('data')
	}


	private hasLocalStorage(): boolean {
		try {
			const TEST_NAME = 'BrowserQuest-test'
			window.localStorage.setItem(TEST_NAME, '123')
			window.localStorage.removeItem(TEST_NAME)
			return true
		} catch (err) {
			return false
		}
	}
}

const storage = new Storage()

export default storage

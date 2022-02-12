version = $$(git tag --sort=committerdate | tail -1)
bundle: test fmt lint
	echo $(version)
	deno run --allow-write --allow-env --allow-run --allow-read build.ts $(version)
test: fmt lint
	deno test --allow-write --allow-read --unstable tests.ts


lint: fmt
	deno lint --config ./deno.config.json 

fmt:
	deno fmt  --config ./deno.config.json 

publish: bundle
	cd lib
	npm publish

human_coverage:
	rm -rf coverage || true
	rm -rf cov_profile || true
	rm coverage.lcov || true
	deno test --unstable --coverage=coverage ./tests.ts   
	deno --unstable coverage ./coverage --lcov > coverage.lcov
	genhtml -o cov_profile/html coverage.lcov
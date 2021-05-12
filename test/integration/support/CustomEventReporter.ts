const { EVENT_RUN_END, EVENT_TEST_FAIL, EVENT_TEST_PASS, EVENT_SUITE_BEGIN, EVENT_SUITE_END } = Mocha.Runner.constants;

const { ok: passSymbol, err: failSymbol } = Mocha.reporters.Base.symbols;

export default class CustomEventReporter extends Mocha.reporters.HTML {
  indents: number;

  constructor(runner: Mocha.Runner) {
    super(runner);
    this.indents = 0;

    runner
      .on(EVENT_SUITE_BEGIN, (suite) => {
        this.increaseIndent();
        this.logToNodeConsole(suite.title);
        this.increaseIndent();
      })
      .on(EVENT_SUITE_END, () => {
        this.decreaseIndent();
        this.decreaseIndent();
      })
      .on(EVENT_TEST_PASS, (test) => {
        this.logToNodeConsole(`${passSymbol}: ${test.title}`);
      })
      .on(EVENT_TEST_FAIL, (test, err) => {
        this.logToNodeConsole(`${failSymbol}: ${test.title} - error: ${err.message}`);
      })
      .once(EVENT_RUN_END, () => {
        this.indents = 0;
        runner.stats &&
          window.dispatchEvent(
            new CustomEvent('testResult', {
              detail: {
                pass: runner.stats && runner.stats.failures === 0,
                passes: runner.stats.passes,
                total: runner.stats.passes + runner.stats.failures,
              },
            })
          );
      });
  }

  logToNodeConsole(text?: string): void {
    window.dispatchEvent(new CustomEvent('testLog', { detail: this.indent() + text }));
  }

  indent(): string {
    return Array(this.indents).join('  ');
  }

  increaseIndent(): void {
    this.indents++;
  }

  decreaseIndent(): void {
    this.indents--;
  }
}

export default class Deployment {
  async configureBespoke() {
    await this.package.addScript(`bespoke`, `echo "bespoke deployment script not configure"; exit 64`);
    await this.circle.addDeployment({
      branch: `master`,
      script: `npm run bespoke`
    });
  }

  async configureHeroku() {
    throw new Error(`not implemented`);
  }

  async configureSemRel() {
    await this.package.addDevDependency(`semantic-release`);
    await this.package.addScript(`semantic-release`, `semantic-release pre && npm publish && semantic-release post`);
    await this.circle.addDeployment({
      branch: `master`,
      script: `npm run semantic-release || true`
    });
    this.circle.setNodeVersion(this.package.get(`engines.node`));

    await this.services.circle.follow();
    await this.services.circle.addEnvironmentVariable({
      name: `NPM_TOKEN`,
      value: await this.services.npm.getToken()
    });
    await this.services.circle.addEnvironmentVariable({
      name: `GITHUB_TOKEN`,
      value: await this.services.github.getToken()
    });
    // TODO remember to protect branch from admins
    // TODO remember to protected
    await this.services.github.protectBranch(`master`, [`ci/circleci`]);
    await this.package.setVersion(`0.0.0-development`);
    console.info(`Project has been configured for semantic release. Publication will happen automatically once you publish 1.0.0`);
  }

  constructor(config, dependencies) {
    this.config = config;
    if (dependencies) {
      Object.keys(dependencies).forEach((key) => {
        this[key] = dependencies[key];
      });
    }
  }

  prompt() {
    return [
      {
        message: `Deployment type`,
        name: `deployment.type`,
        type: `list`,
        choices: [
          {value: `semrel`, name: `Semantic Release`},
          {value: `heroku`, name: `Heroku`},
          {value: `bespoke`, name: `Bespoke`}
        ],
        when() {
          return !this.config.has(`deployment.type`);
        }
      },
      {
        message: `Platform`,
        name: `deployment.platform`,
        type: `list`,
        choices: [
          {value: `circle`, name: `Circle CI`},
          {value: `none`, name: `None`}
        ]
      }
    ];
  }

  async setup() {
    switch (this.config.get(`deployment.type`)) {
    case `heroku`:
      await this.configureHeroku();
      break;
    case `semrel`:
      await this.configureSemRel();
      break;
    case `bespoke`:
      await this.configureBespoke();
      break;
    default:
    }
  }
}

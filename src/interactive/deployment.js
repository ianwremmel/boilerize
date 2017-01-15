import log from '../lib/decorators/log';
import Service from '../lib/service';

export default class Deployment extends Service {
  @log()
  async configureBespoke() {
    await this.g.config.package.addScript(`bespoke`, `echo "bespoke deployment script not configure"; exit 64`);
    if (this.config.get(`deployment.platform`) === `circle`) {
      await this.g.config.circle.addDeployment({
        branch: `master`,
        script: `npm run bespoke`
      });
    }
  }

  @log()
  async configureHeroku() {
    throw new Error(`not implemented`);
  }

  @log()
  async configureSemRel() {
    await this.g.config.package.addDevDependency(`semantic-release`);
    await this.g.config.package.addScript(`semantic-release`, `semantic-release pre && npm publish && semantic-release post`);
    await this.g.config.circle.addDeployment({
      branch: `master`,
      name: `semantic-release`,
      script: `npm run semantic-release || true`
    });

    await this.g.services.circle.follow();
    await this.g.services.circle.addEnvironmentVariable({
      name: `NPM_TOKEN`,
      value: await this.g.services.npm.getToken()
    });
    await this.g.services.circle.addEnvironmentVariable({
      name: `GITHUB_TOKEN`,
      value: await this.g.services.github.getToken()
    });
    await this.g.config.package.setVersion(`0.0.0-development`);
    console.info(`Project has been configured for semantic release. Publication will happen automatically once you publish 1.0.0`);
  }

  prompts() {
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
        when: () => !this.config.has(`deployment.type`)
      },
      {
        message: `Platform`,
        name: `deployment.platform`,
        type: `list`,
        choices: [
          {value: `circle`, name: `Circle CI`},
          {value: `none`, name: `None`}
        ],
        when: (answers) => {
          this.config.merge(answers);
          return !this.config.has(`deployment.platform`);
        }
      }
    ];
  }

  @log()
  // eslint-disable-next-line complexity
  async setup() {
    if (this.config.get(`deployment.platform`) !== `circle` && this.config.get(`deployment.type`) !== `bespoke`) {
      console.warn(`At this time, only bespoke deployments are available for CI platforms other than Circle CI`);
      return;
    }

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

    if (this.config.get(`deployment.platform`) === `circle`) {
      if (this.g.config.package.has(`engines.node`)) {
        this.g.config.circle.setNodeVersion(this.g.config.package.get(`engines.node`));
      }
    }

    if (this.config.get(`project.github`) === `circle`) {
      // TODO protect master
      // TODO remember to protect branch from admins
      // await this.g.services.github.protectBranch(`master`, [`ci/circleci`]);
    }
  }
}

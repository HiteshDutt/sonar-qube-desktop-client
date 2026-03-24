# Sonar Desktop Client
Aim of the application is to help users Download issues from Sonar into excel.

## What happens?

Application downloads issues into excel from sonar server specified. The issues are based on user, sonar project and branch

## How to make this run

### pre requisite
1. Git
2. node (ver 18 and above)

### install and run
1. Clone Repo
```git
git clone https://github.com/HiteshDutt/sonar-qube-desktop-client.git
```
2. Get into repo branch
```ps/sh
cd sonar-qube-desktop-client
``` 
3. configure application

- In [appsettings](src/config//appsettings.ts) update your required settings
  - `sonarBaseUrl` -> sonar server base url
  - `sonarToken` -> user token from [sonar](https://docs.sonarsource.com/sonarqube/9.8/user-guide/user-account/generating-and-using-tokens/#:~:text=You%20can%20generate%20new%20tokens,or%20choose%20%22no%20expiration%22.) server.
  - `sonarProjectKey` -> sonar project key from sonar server
  - `branch` -> branch for which you need to extract sonar results and issues, this branch should have been analyzed and results should be available on sonar server before running the tool.
  - `compareBranch` -> array of branches that needs to be compared, when compare is executed, analysis for both branches should be downloaded
  - `pageSize` -> maximum number of records required to be fetched in single request (maximum of 500)
  - `maxRecordsToBeUpdaate` -> maximum records to be updated while running update utility
  - `outputDirectory` -> directory where result should be published for export or used to import while performing update


4. run npm
```ps/sh
npm install
```
5. run export utility
```ps
npm run dev:read
```
#### or

5. run update utility
```ps
npm run dev:update
```

#### or

5. run compare utility
This needs
1. analysis done on two different version
2. excel output for two analysis to be available in output folder
```ps
npm run dev:compare
```

6. run unit test
```ps
npm run jest
```
## Where is the output

you can see your output files in ./output folder by default, or in folder as configured in [appsettings.ts](src/config/appsettings.ts)

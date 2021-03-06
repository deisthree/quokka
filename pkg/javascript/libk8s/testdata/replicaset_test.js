replicasetname = "myreplicaset"
myreplicaset = {
    "kind": "ReplicaSet",
    "apiVersion": "extensions/v1beta1",
    "metadata": {
        "name": replicasetname,
        "namespace": "default",
        "labels": {
            "heritage": "Quokka",
        },
    },
    "spec": {
      "replicas": 1,
      "selector": {"app": "nginx"},
      "template": {
        "metadata": {"name": "nginx"},
        "spec": {
          "containers": [
              {
                  "name": "waiter",
                  "image": "alpine:3.3",
                  "command": [
                      "/bin/sleep",
                      "9000"
                  ],
                  "imagePullPolicy": "IfNotPresent"
              }
          ]
        }
      }
    }
};

rs = kubernetes.withNS("default").extensions.replicaset

res = rs.create(myreplicaset)
if (res.metadata.name != replicasetname) {
	throw "expected replicaset named " + replicasetname
}

// Get our new replicaset by name
pp = rs.get(replicasetname)
if (pp.metadata.name != replicasetname) {
	throw "unexpected replicaset name: " + pp.metadata.name
}

// Search for our new replicaset.
matches = rs.list({labelSelector: "heritage = Quokka"})
if (matches.items.length == 0) {
	throw "expected at least one replicaset in list"
}

// Update the replicaset
res.metadata.annotations = {"foo": "bar"}
res2 = rs.update(res)
if (res2.metadata.annotations.foo != "bar") {
	throw "expected foo annotation"
}

rs.delete(replicasetname, {})
rs.deleteCollection({}, {labelSelector: "heritage=Quokka"})
